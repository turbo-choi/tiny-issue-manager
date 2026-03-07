"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createUser as createUserRequest, updateUser as updateUserRequest } from "@/lib/user-service";
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
      className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-accent"
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>
          {role}
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

  useEffect(() => {
    setRole(user.role);
    setIsActive(user.isActive);
  }, [user]);

  return (
    <tr className="border-t border-line">
      <td className="px-4 py-4">
        <p className="font-medium text-ink">{user.name}</p>
        <p className="text-sm text-slate-500">{user.email}</p>
      </td>
      <td className="px-4 py-4">
        <RoleSelect value={role} onChange={setRole} />
      </td>
      <td className="px-4 py-4">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active
        </label>
      </td>
      <td className="px-4 py-4">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Optional reset password"
          className="w-full min-w-[180px] rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-accent"
        />
      </td>
      <td className="px-4 py-4">
        <button
          type="button"
          disabled={isSaving}
          onClick={async () => {
            try {
              setIsSaving(true);
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
            } finally {
              setIsSaving(false);
            }
          }}
          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
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
      <section className="rounded-[28px] border border-line bg-paper p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Lead tools</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">Create user</h2>
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
              setError(submitError instanceof Error ? submitError.message : "User could not be created.");
            } finally {
              setIsCreating(false);
            }
          }}
        >
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Name"
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
          <RoleSelect value={form.role} onChange={(role) => setForm((current) => ({ ...current, role }))} />
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
          <div className="flex justify-end lg:col-span-4">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>

        {error ? <p className="mt-4 rounded-2xl bg-alertSoft px-4 py-3 text-sm text-alert">{error}</p> : null}
      </section>

      <section className="overflow-hidden rounded-[28px] border border-line bg-paper shadow-card">
        <div className="border-b border-line px-5 py-4">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">User directory</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Manage roles and access</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-sand text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reset password</th>
                <th className="px-4 py-3">Action</th>
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
