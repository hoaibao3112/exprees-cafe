import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  loyaltyPoints: number;
  isActive: boolean;
  role?: {
    id: number;
    name: string;
    description?: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setSession: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),
  clearSession: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}));
