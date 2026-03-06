import type { CreateUserInput, UpdateUserInput } from "@/types/user";
import { createUser, listUsers, updateUser } from "@/server/db";

export function listManagedUsers() {
  return listUsers();
}

export function createManagedUser(input: CreateUserInput) {
  return createUser(input);
}

export function updateManagedUser(id: string, input: UpdateUserInput) {
  return updateUser({
    id,
    role: input.role,
    isActive: input.isActive,
    password: input.password,
  });
}
