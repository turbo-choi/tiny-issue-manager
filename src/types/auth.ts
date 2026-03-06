import type { UserRole } from "@/types/user";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SignInInput {
  email: string;
  password: string;
}
