export type UserRole = "lead" | "member" | "planner";

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserInput {
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}
