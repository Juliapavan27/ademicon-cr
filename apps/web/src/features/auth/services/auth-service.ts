import type { AuthRepository } from "../domain/auth-repository";
import type { AppUser } from "../domain/user";

const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos.";

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  getCurrentUser(): Promise<AppUser | null> {
    return this.repository.getCurrentUser();
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.repository.signInWithPassword(email, password);
    if (!error) return { error: null };

    const friendlyMessage = error.toLowerCase().includes("invalid")
      ? INVALID_CREDENTIALS_MESSAGE
      : error;

    return { error: friendlyMessage };
  }

  signOut(): Promise<void> {
    return this.repository.signOut();
  }
}
