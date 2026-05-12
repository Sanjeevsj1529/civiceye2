import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  notifications: any[];
  gdprAccepted: boolean;
  onboardingComplete: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  highContrast: boolean;
  dyslexicFont: boolean;
  rtl: boolean;
  speedMultiplier: number;

  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  setCommandPalette: (open: boolean) => void;
  addNotification: (notification: any) => void;
  acceptGDPR: () => void;
  setLanguage: (rtl: boolean) => void;
  setAccessibility: (key: string, value: any) => void;
  setAllSettings: (settings: Partial<UIState>) => void;
  setSpeedMultiplier: (speed: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: true,
      sidebarOpen: true,
      commandPaletteOpen: false,
      notifications: [],
      gdprAccepted: false,
      onboardingComplete: false,
      fontSize: 'md',
      highContrast: false,
      dyslexicFont: false,
      rtl: false,
      speedMultiplier: 1,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      setCommandPalette: (open) => set({ commandPaletteOpen: open }),
      addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
      acceptGDPR: () => set({ gdprAccepted: true }),
      setLanguage: (rtl) => set({ rtl }),
      setAccessibility: (key, value) => set({ [key]: value } as any),
      setAllSettings: (settings) => set((state) => ({ ...state, ...settings })),
      setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
    }),
    { name: 'civiceye-ui' }
  )
);
