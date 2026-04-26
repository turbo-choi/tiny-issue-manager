import { createHmac } from "node:crypto";

import type { SessionUser } from "@/types/auth";
import type { ManagedUser } from "@/types/user";
import {
  createSession,
  deleteSession,
  findSession,
  getUserByEmail,
  getUserCredentials,
  purgeExpiredSessions,
  verifyPassword,
} from "@/server/db";

const SESSION_COOKIE = "simple_issue_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sessionSecret() {
  return process.env.SESSION_SECRET ?? "local-dev-session-secret";
}

function signSessionId(sessionId: string) {
  return createHmac("sha256", sessionSecret()).update(sessionId).digest("hex");
}

export function serializeSessionCookie(sessionId: string) {
  return `${sessionId}.${signSessionId(sessionId)}`;
}

function parseSignedSession(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [sessionId, signature] = value.split(".");
  if (!sessionId || !signature) {
    return null;
  }

  return signSessionId(sessionId) === signature ? sessionId : null;
}

function toSessionUser(user: ManagedUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  return {
    ...sessionCookieOptions(),
    maxAge: 0,
  };
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function loginWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getUserByEmail(normalizedEmail);

  if (!user || user.is_active !== 1) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  const isValid = verifyPassword(password, user.password_hash, user.password_salt);
  if (!isValid) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  purgeExpiredSessions(new Date().toISOString());
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  const sessionId = createSession(user.id, expiresAt);

  return {
    user: toSessionUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active === 1,
      createdAt: user.created_at,
    }),
    signedSession: serializeSessionCookie(sessionId),
  };
}

export function getUserFromSessionCookie(cookieValue: string | undefined) {
  const sessionId = parseSignedSession(cookieValue);
  if (!sessionId) {
    return null;
  }

  purgeExpiredSessions(new Date().toISOString());
  const session = findSession(sessionId);
  if (!session) {
    return null;
  }

  const user = getUserCredentials(session.user_id);
  if (!user || user.is_active !== 1) {
    deleteSession(session.id);
    return null;
  }

  return toSessionUser({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.is_active === 1,
    createdAt: user.created_at,
  });
}

export function logoutFromSessionCookie(cookieValue: string | undefined) {
  const sessionId = parseSignedSession(cookieValue);
  if (!sessionId) {
    return;
  }

  deleteSession(sessionId);
}
