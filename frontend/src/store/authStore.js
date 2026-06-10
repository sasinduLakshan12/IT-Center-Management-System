import { create } from 'zustand';

// Try to get user from local storage
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;

export const useAuthStore = create((set) => ({
    user: user,
    login: (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData });
    },
    logout: () => {
        localStorage.removeItem('user');
        set({ user: null });
    }
}));
