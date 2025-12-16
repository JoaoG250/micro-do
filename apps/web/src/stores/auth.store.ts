import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload, AuthUser } from "@repo/common/types/auth";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (accessToken: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,
  login: (accessToken) => {
    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const user: AuthUser = {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.username,
      };
      set({ accessToken, user, isAuthenticated: true });
    } catch (error) {
      console.error("Failed to decode token", error);
      set({ ...initialState });
    }
  },
  logout: () => {
    set({ ...initialState });
  },
  checkAuth: async () => {
    try {
      const { accessToken } = await authService.refresh();
      if (accessToken) {
        const decoded = jwtDecode<JwtPayload>(accessToken);
        const user: AuthUser = {
          id: decoded.sub,
          email: decoded.email,
          username: decoded.username,
        };
        set({ accessToken, user, isAuthenticated: true });
      }
    } catch {
      set({ ...initialState });
    }
  },
}));
