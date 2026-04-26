import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import type { ManagedUser, UserRole } from "@/types/user";
import type { Issue, IssueHistoryEntry, IssueHistoryField, IssueStatus, UpdateIssueInput } from "@/types/issue";

const DATA_DIR = path.join(process.cwd(), "data");
const LEGACY_DATABASE_PATH = path.join(DATA_DIR, "app-db.json");
const DATABASE_PATH = path.isAbsolute(process.env.DATABASE_URL ?? "")
  ? (process.env.DATABASE_URL as string)
  : path.join(process.cwd(), process.env.DATABASE_URL ?? "data/app.db");

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: number;
  created_at: string;
  password_hash: string;
  password_salt: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
};

type IssueRow = {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  creator_name: string;
  assignee_id: string;
  assignee_name: string;
  status: IssueStatus;
  due_date: string;
  created_at: string;
  updated_at: string;
};

type IssueEventRow = {
  id: string;
  issue_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  field: IssueHistoryField;
  from_value: string;
  to_value: string;
  created_at: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __simpleIssueDb: Database.Database | undefined;
}

function ensureDataDir() {
  mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
  mkdirSync(DATA_DIR, { recursive: true });
}

function createPasswordRecord(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function canSeedDefaultData() {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_SEED_DATA === "true";
}

function getBootstrapLeadConfig() {
  const email = process.env.BOOTSTRAP_LEAD_EMAIL?.trim().toLowerCase() ?? "";
  const name = process.env.BOOTSTRAP_LEAD_NAME?.trim() ?? "";
  const password = process.env.BOOTSTRAP_LEAD_PASSWORD?.trim() ?? "";

  if (!email && !name && !password) {
    return null;
  }

  if (!email || !name || !password) {
    throw new Error(
      "BOOTSTRAP_LEAD_EMAIL, BOOTSTRAP_LEAD_NAME, BOOTSTRAP_LEAD_PASSWORD는 함께 설정해야 합니다.",
    );
  }

  return { email, name, password };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function makeDate(offsetDays: number) {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString();
}

function makeDueDate(offsetDays: number) {
  return makeDate(offsetDays).slice(0, 10);
}

function mapUser(row: Pick<UserRow, "id" | "email" | "name" | "role" | "is_active" | "created_at">): ManagedUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

function mapIssue(row: IssueRow): Issue {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    assigneeId: row.assignee_id,
    assigneeName: row.assignee_name,
    status: row.status,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapIssueEvent(row: IssueEventRow): IssueHistoryEntry {
  return {
    id: row.id,
    issueId: row.issue_id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    field: row.field,
    fromValue: row.from_value,
    toValue: row.to_value,
    createdAt: row.created_at,
  };
}

function initSchema(db: Database.Database) {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      assignee_id TEXT NOT NULL,
      assignee_name TEXT NOT NULL,
      status TEXT NOT NULL,
      due_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS issue_events (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      field TEXT NOT NULL,
      from_value TEXT NOT NULL,
      to_value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);
}

function seedUsers(db: Database.Database) {
  const existingCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (existingCount.count > 0) {
    return;
  }

  if (existsSync(LEGACY_DATABASE_PATH)) {
    try {
      const legacy = JSON.parse(readFileSync(LEGACY_DATABASE_PATH, "utf8")) as {
        users?: Array<{
          id: string;
          email: string;
          name: string;
          role?: UserRole;
          createdAt: string;
          passwordHash: string;
          passwordSalt: string;
        }>;
        issues?: Issue[];
        sessions?: Array<{ id: string; userId: string; createdAt: string; expiresAt: string }>;
      };

      const insertUser = db.prepare(`
        INSERT INTO users (id, email, name, role, is_active, created_at, password_hash, password_salt)
        VALUES (@id, @email, @name, @role, @is_active, @created_at, @password_hash, @password_salt)
      `);
      const insertSession = db.prepare(`
        INSERT INTO sessions (id, user_id, created_at, expires_at)
        VALUES (@id, @user_id, @created_at, @expires_at)
      `);
      const insertIssue = db.prepare(`
        INSERT INTO issues (
          id, title, description, creator_id, creator_name, assignee_id, assignee_name, status, due_date, created_at, updated_at
        ) VALUES (
          @id, @title, @description, @creator_id, @creator_name, @assignee_id, @assignee_name, @status, @due_date, @created_at, @updated_at
        )
      `);

      const importTransaction = db.transaction(() => {
        for (const user of legacy.users ?? []) {
          insertUser.run({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role ?? "member",
            is_active: 1,
            created_at: user.createdAt,
            password_hash: user.passwordHash,
            password_salt: user.passwordSalt,
          });
        }

        for (const session of legacy.sessions ?? []) {
          insertSession.run({
            id: session.id,
            user_id: session.userId,
            created_at: session.createdAt,
            expires_at: session.expiresAt,
          });
        }

        for (const issue of legacy.issues ?? []) {
          insertIssue.run({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            creator_id: issue.creatorId,
            creator_name: issue.creatorName,
            assignee_id: issue.assigneeId,
            assignee_name: issue.assigneeName,
            status: issue.status,
            due_date: issue.dueDate,
            created_at: issue.createdAt,
            updated_at: issue.updatedAt,
          });
        }
      });

      importTransaction();
      return;
    } catch {
      // Fall back to fresh SQLite seed if legacy import fails.
    }
  }

  const bootstrapLead = getBootstrapLeadConfig();
  if (bootstrapLead) {
    const passwordRecord = createPasswordRecord(bootstrapLead.password);
    db.prepare(`
      INSERT INTO users (id, email, name, role, is_active, created_at, password_hash, password_salt)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      createEntityId("user"),
      bootstrapLead.email,
      bootstrapLead.name,
      "lead",
      new Date().toISOString(),
      passwordRecord.hash,
      passwordRecord.salt,
    );
    return;
  }

  if (!canSeedDefaultData()) {
    return;
  }

  const password = process.env.SEED_USER_PASSWORD ?? "changeme123!";
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, role, is_active, created_at, password_hash, password_salt)
    VALUES (@id, @email, @name, @role, 1, @created_at, @password_hash, @password_salt)
  `);
  const insertIssue = db.prepare(`
    INSERT INTO issues (
      id, title, description, creator_id, creator_name, assignee_id, assignee_name, status, due_date, created_at, updated_at
    ) VALUES (
      @id, @title, @description, @creator_id, @creator_name, @assignee_id, @assignee_name, @status, @due_date, @created_at, @updated_at
    )
  `);

  const leadPassword = createPasswordRecord(password);
  const memberPassword = createPasswordRecord(password);
  const plannerPassword = createPasswordRecord(password);
  const lead = {
    id: "user-lead",
    email: "team.lead@example.com",
    name: "팀 리드",
    role: "lead" as const,
    created_at: new Date().toISOString(),
    password_hash: leadPassword.hash,
    password_salt: leadPassword.salt,
  };
  const member = {
    id: "user-member",
    email: "team.member@example.com",
    name: "팀 멤버",
    role: "member" as const,
    created_at: new Date().toISOString(),
    password_hash: memberPassword.hash,
    password_salt: memberPassword.salt,
  };
  const planner = {
    id: "user-planner",
    email: "team.planner@example.com",
    name: "플래너",
    role: "planner" as const,
    created_at: new Date().toISOString(),
    password_hash: plannerPassword.hash,
    password_salt: plannerPassword.salt,
  };

  const seedTransaction = db.transaction(() => {
    insertUser.run(lead);
    insertUser.run(member);
    insertUser.run(planner);

    insertIssue.run({
      id: "issue-seed-1",
      title: "마케팅 문구 최종 확인",
      description: "릴리즈 전 최종 검토를 기다리고 있습니다.",
      creator_id: planner.id,
      creator_name: planner.name,
      assignee_id: lead.id,
      assignee_name: lead.name,
      status: "Todo",
      due_date: makeDueDate(-1),
      created_at: makeDate(-4),
      updated_at: makeDate(-2),
    });

    insertIssue.run({
      id: "issue-seed-2",
      title: "릴리즈 체크리스트 검토",
      description: "배포 메모를 확인하고 롤백 절차를 점검합니다.",
      creator_id: lead.id,
      creator_name: lead.name,
      assignee_id: member.id,
      assignee_name: member.name,
      status: "In Progress",
      due_date: makeDueDate(1),
      created_at: makeDate(-2),
      updated_at: makeDate(-1),
    });

    insertIssue.run({
      id: "issue-seed-3",
      title: "히어로 섹션 배포 완료",
      description: "결과 확인을 위해 완료 상태로 보관된 이슈입니다.",
      creator_id: planner.id,
      creator_name: planner.name,
      assignee_id: member.id,
      assignee_name: member.name,
      status: "Done",
      due_date: makeDueDate(-3),
      created_at: makeDate(-6),
      updated_at: makeDate(-1),
    });
  });

  seedTransaction();
}

export function getDatabase() {
  if (!globalThis.__simpleIssueDb) {
    ensureDataDir();
    const db = new Database(DATABASE_PATH);
    initSchema(db);
    seedUsers(db);
    globalThis.__simpleIssueDb = db;
  }

  return globalThis.__simpleIssueDb;
}

export function createSessionId() {
  return randomBytes(24).toString("hex");
}

export function createEntityId(prefix: string) {
  return `${prefix}-${randomBytes(8).toString("hex")}`;
}

export function getUserByEmail(email: string) {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1")
    .get(email) as UserRow | undefined;
}

export function getUserById(id: string) {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(id) as UserRow | undefined;
  return row ? mapUser(row) : null;
}

export function getUserCredentials(id: string) {
  const db = getDatabase();
  return db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(id) as UserRow | undefined;
}

export function listUsers() {
  const db = getDatabase();
  const rows = db
    .prepare("SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at ASC")
    .all() as Array<Pick<UserRow, "id" | "email" | "name" | "role" | "is_active" | "created_at">>;
  return rows.map(mapUser);
}

export function createUser(input: { email: string; name: string; role: UserRole; password: string }) {
  const db = getDatabase();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password.trim();

  if (!email || !name || !password) {
    throw new Error("이름, 이메일, 역할, 비밀번호를 입력해주세요.");
  }

  if (getUserByEmail(email)) {
    throw new Error("이미 같은 이메일을 사용하는 사용자가 있습니다.");
  }

  const passwordRecord = createPasswordRecord(password);
  const userId = createEntityId("user");
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO users (id, email, name, role, is_active, created_at, password_hash, password_salt)
    VALUES (?, ?, ?, ?, 1, ?, ?, ?)
  `).run(userId, email, name, input.role, createdAt, passwordRecord.hash, passwordRecord.salt);

  const user = getUserById(userId);
  if (!user) {
    throw new Error("사용자를 생성하지 못했습니다.");
  }
  return user;
}

export function updateUser(input: { id: string; role?: UserRole; isActive?: boolean; password?: string }) {
  const db = getDatabase();
  const current = db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(input.id) as UserRow | undefined;
  if (!current) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  const nextRole = input.role ?? current.role;
  const nextActive = typeof input.isActive === "boolean" ? (input.isActive ? 1 : 0) : current.is_active;
  db.prepare("UPDATE users SET role = ?, is_active = ? WHERE id = ?").run(nextRole, nextActive, input.id);

  if (input.password && input.password.trim()) {
    const passwordRecord = createPasswordRecord(input.password.trim());
    db.prepare("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?").run(
      passwordRecord.hash,
      passwordRecord.salt,
      input.id,
    );
  }

  const user = getUserById(input.id);
  if (!user) {
    throw new Error("사용자를 수정하지 못했습니다.");
  }
  return user;
}

export function createSession(userId: string, expiresAt: string) {
  const db = getDatabase();
  const sessionId = createSessionId();
  db.prepare("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    sessionId,
    userId,
    new Date().toISOString(),
    expiresAt,
  );
  return sessionId;
}

export function deleteSession(sessionId: string) {
  getDatabase().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export function purgeExpiredSessions(nowIso: string) {
  getDatabase().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(nowIso);
}

export function findSession(sessionId: string) {
  const db = getDatabase();
  return db.prepare("SELECT * FROM sessions WHERE id = ? LIMIT 1").get(sessionId) as SessionRow | undefined;
}

export function listIssues() {
  const db = getDatabase();
  const rows = db
    .prepare("SELECT * FROM issues ORDER BY datetime(updated_at) DESC")
    .all() as IssueRow[];
  return rows.map(mapIssue);
}

export function createIssue(input: {
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
}) {
  const db = getDatabase();
  const issueId = createEntityId("issue");
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO issues (
      id, title, description, creator_id, creator_name, assignee_id, assignee_name, status, due_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    issueId,
    input.title,
    input.description,
    input.creatorId,
    input.creatorName,
    input.assigneeId,
    input.assigneeName,
    "Todo",
    input.dueDate,
    now,
    now,
  );

  const row = db.prepare("SELECT * FROM issues WHERE id = ? LIMIT 1").get(issueId) as IssueRow | undefined;
  if (!row) {
    throw new Error("이슈를 등록하지 못했습니다.");
  }
  return mapIssue(row);
}

export function findIssue(id: string) {
  const row = getDatabase().prepare("SELECT * FROM issues WHERE id = ? LIMIT 1").get(id) as IssueRow | undefined;
  return row ? mapIssue(row) : null;
}

export function updateIssueStatus(id: string, status: IssueStatus) {
  const db = getDatabase();
  db.prepare("UPDATE issues SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), id);
  const row = db.prepare("SELECT * FROM issues WHERE id = ? LIMIT 1").get(id) as IssueRow | undefined;
  if (!row) {
    throw new Error("이슈를 찾을 수 없습니다.");
  }
  return mapIssue(row);
}

export function updateIssue(
  id: string,
  input: Omit<UpdateIssueInput, "dueDate"> & {
    dueDate?: string;
    assigneeName?: string;
  },
) {
  const db = getDatabase();
  const current = db.prepare("SELECT * FROM issues WHERE id = ? LIMIT 1").get(id) as IssueRow | undefined;
  if (!current) {
    throw new Error("이슈를 찾을 수 없습니다.");
  }

  const updates: string[] = [];
  const values: Array<string> = [];

  if (typeof input.title === "string") {
    updates.push("title = ?");
    values.push(input.title);
  }
  if (typeof input.description === "string") {
    updates.push("description = ?");
    values.push(input.description);
  }
  if (typeof input.assigneeId === "string") {
    updates.push("assignee_id = ?");
    values.push(input.assigneeId);
  }
  if (typeof input.assigneeName === "string") {
    updates.push("assignee_name = ?");
    values.push(input.assigneeName);
  }
  if (typeof input.status === "string") {
    updates.push("status = ?");
    values.push(input.status);
  }
  if (typeof input.dueDate === "string") {
    updates.push("due_date = ?");
    values.push(input.dueDate);
  }

  if (updates.length === 0) {
    return mapIssue(current);
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString(), id);

  db.prepare(`UPDATE issues SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const row = db.prepare("SELECT * FROM issues WHERE id = ? LIMIT 1").get(id) as IssueRow | undefined;
  if (!row) {
    throw new Error("이슈를 찾을 수 없습니다.");
  }
  return mapIssue(row);
}

export function deleteIssue(id: string) {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM issues WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw new Error("이슈를 찾을 수 없습니다.");
  }
}

export function createIssueEvents(
  entries: Array<{
    issueId: string;
    actorId: string;
    actorName: string;
    actorRole: UserRole;
    field: IssueHistoryField;
    fromValue: string;
    toValue: string;
  }>,
) {
  if (entries.length === 0) {
    return;
  }

  const db = getDatabase();
  const insert = db.prepare(`
    INSERT INTO issue_events (id, issue_id, actor_id, actor_name, actor_role, field, from_value, to_value, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((items: typeof entries) => {
    const now = new Date().toISOString();
    for (const entry of items) {
      insert.run(
        createEntityId("event"),
        entry.issueId,
        entry.actorId,
        entry.actorName,
        entry.actorRole,
        entry.field,
        entry.fromValue,
        entry.toValue,
        now,
      );
    }
  });

  transaction(entries);
}

export function listIssueEvents(
  issueId: string,
  options: {
    field?: IssueHistoryField;
    lookbackDays?: 7 | 30;
    fromIso?: string;
    toIso?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 5));
  const offset = (page - 1) * pageSize;

  const db = getDatabase();
  const whereParts = ["issue_id = ?"];
  const whereValues: Array<string> = [issueId];

  if (options.field) {
    whereParts.push("field = ?");
    whereValues.push(options.field);
  }
  if (options.lookbackDays) {
    const since = new Date();
    since.setDate(since.getDate() - options.lookbackDays);
    whereParts.push("datetime(created_at) >= datetime(?)");
    whereValues.push(since.toISOString());
  }
  if (options.fromIso) {
    whereParts.push("datetime(created_at) >= datetime(?)");
    whereValues.push(options.fromIso);
  }
  if (options.toIso) {
    whereParts.push("datetime(created_at) <= datetime(?)");
    whereValues.push(options.toIso);
  }

  const whereClause = whereParts.join(" AND ");
  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM issue_events WHERE ${whereClause}`)
    .get(...whereValues) as { count: number };
  const total = totalRow.count;

  const rows = db
    .prepare(`SELECT * FROM issue_events WHERE ${whereClause} ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?`)
    .all(...whereValues, pageSize, offset) as IssueEventRow[];

  return {
    history: rows.map(mapIssueEvent),
    pagination: {
      page,
      pageSize,
      total,
      hasNext: offset + rows.length < total,
    },
  };
}
