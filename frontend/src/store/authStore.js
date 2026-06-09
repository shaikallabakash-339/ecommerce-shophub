import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  
  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  },
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  },
  
  isAuthenticated: () => {
    const state = useAuthStore.getState();
    return !!state.token && !!state.user;
  }
}));

export const useCartStore = create((set) => ({
  items: [],
  total: 0,
  
  setItems: (items) => {
    const total = items.reduce((sum, item) => {
      const price = item.price * (1 - (item.discount_percentage || 0) / 100);
      return sum + (price * item.quantity);
    }, 0);
    set({ items, total });
  },
  
  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.product_id === item.product_id);
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        )
      };
    }
    return { items: [...state.items, item] };
  }),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.id === id ? { ...i, quantity } : i
    )
  })),
  
  clearCart: () => set({ items: [], total: 0 })
}));
