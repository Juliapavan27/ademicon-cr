import type { AppUser } from "./user";

export interface AuthRepository {
  getCurrentUser(): Promise<AppUser | null>;
  signInWithPassword(email: string, password: string): Promise<{ error: string | null }>;
  signOut(): Promise<void>;
}
