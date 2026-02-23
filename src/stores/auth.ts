import { defineStore } from 'pinia';

interface AuthState {
  token: string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('admin_token') || '',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('admin_token', token);
    },
    logout() {
      this.token = '';
      localStorage.removeItem('admin_token');
    },
  },
});
