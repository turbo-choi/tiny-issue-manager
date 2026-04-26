"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createUser as createUserRequest, updateUser as updateUserRequest } from "@/lib/user-service";
import { formatUserRole } from "@/lib/i18n";
import type { CreateUserInput, ManagedUser, UserRole } from "@/types/user";

const ROLES: UserRole[] = ["lead", "member", "planner"];

const EMPTY_FORM: CreateUserInput = {
  email: "",
  name: "",
  role: "member",
  password: "",
};

function RoleSelect({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (nextRole: UserRole) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as UserRole)}
      className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-body outline-none focus:border-accent"
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>
          {formatUserRole(role)}
        </option>
      ))}
    </select>
  );
}

function UserRow({
  user,
  onUpdated,
}: {
  user: ManagedUser;
  onUpdated: (nextUser: ManagedUser) => void;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(user.role);
    setIsActive(user.isActive);
    setError("");
  }, [user]);

  return (
    <tr className="border-t border-line">
      <td className="px-4 py-4">
        <p className="font-medium text-body">{user.name}</p>
        <p className="text-sm text-muted">{user.email}</p>
      </td>
      <td className="px-4 py-4">
        <RoleSelect value={role} onChange={setRole} />
      </td>
      <td className="px-4 py-4">
        <label className="inline-flex items-center gap-2 text-sm text-body">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          활성
        </label>
      </td>
      <td className="px-4 py-4">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호 재설정 선택"
          className="w-full min-w-[180px] rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </td>
      <td className="px-4 py-4">
        <button
          type="button"
          disabled={isSaving}
          onClick={async () => {
            try {
              setIsSaving(true);
              setError("");
              const nextUser = await updateUserRequest(user.id, {
                role,
                isActive,
                password: password.trim() || undefined,
              });
              setPassword("");
              onUpdated(nextUser);
              startTransition(() => {
                router.refresh();
              });
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "사용자를 수정하지 못했습니다.");
            } finally {
              setIsSaving(false);
            }
          }}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-body hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
        {error ? <p className="mt-2 text-sm text-alert">{error}</p> : null}
      </td>
    </tr>
  );
}

export function UserManagementPanel({
  initialUsers,
}: {
  initialUsers: ManagedUser[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState<CreateUserInput>({
    ...EMPTY_FORM,
    password: "changeme123!",
  });
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-line bg-paper p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">리드 도구</p>
        <h2 className="mt-2 text-xl font-semibold text-brand">사용자 생성</h2>
        <form
          className="mt-5 grid gap-4 lg:grid-cols-4"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              setError("");
              setIsCreating(true);
              const nextUser = await createUserRequest(form);
              setUsers((current) => [...current, nextUser]);
              setForm({ ...EMPTY_FORM, password: form.password });
              startTransition(() => {
                router.refresh();
              });
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "사용자를 생성하지 못했습니다.");
            } finally {
              setIsCreating(false);
            }
          }}
        >
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="이름"
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="이메일"
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <RoleSelect value={form.role} onChange={(role) => setForm((current) => ({ ...current, role }))} />
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="비밀번호"
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <div className="flex justify-end lg:col-span-4">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "생성 중..." : "사용자 생성"}
            </button>
          </div>
        </form>

        {error ? <p className="mt-4 rounded-xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p> : null}
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-paper shadow-card">
        <div className="border-b border-line px-5 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">사용자 목록</p>
          <h2 className="mt-2 text-xl font-semibold text-brand">역할과 접근 권한 관리</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-sand text-xs uppercase tracking-[0.18em] text-muted">
              <tr>
                <th className="px-4 py-3">사용자</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">비밀번호 재설정</th>
                <th className="px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onUpdated={(nextUser) =>
                    setUsers((current) => current.map((entry) => (entry.id === nextUser.id ? nextUser : entry)))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
