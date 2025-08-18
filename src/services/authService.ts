import api from './apiClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

class AuthService {
  private user: AuthUser | null = null;

  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const response = await api.auth.login(email, password);
      this.user = response.user;
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout(): void {
    this.user = null;
    api.auth.logout();
  }

  isAuthenticated(): boolean {
    return api.auth.isAuthenticated();
  }

  getCurrentUser(): AuthUser | null {
    return this.user;
  }
}

export const authService = new AuthService();
export default authService;