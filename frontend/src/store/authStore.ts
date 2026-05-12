import { create } from 'zustand';
import { User, UserRole } from '../types/user';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyAccount: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  updatePrivacyMode: (enabled: boolean) => Promise<void>;
  updateUISettings: (settings: Partial<User>) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  updateAvatar: (url: string) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // start loading while checking auth state

  login: async (email, password) => {
    set({ isLoading: true });
    
    // Demo Account Bypass
    const demoAccounts = ['citizen@civiceye.com', 'officer@civiceye.com', 'zonal@civiceye.com', 'admin@civiceye.com'];
    if (demoAccounts.includes(email)) {
      const mockRole = 
        email === 'admin@civiceye.com' ? 'super_admin' : 
        email === 'zonal@civiceye.com' ? 'zonal_admin' : 
        email === 'officer@civiceye.com' ? 'officer' : 'citizen';
      const mockUser: User = {
        id: 'demo_user_id',
        email: email,
        name: 
          email === 'admin@civiceye.com' ? 'Super Admin' : 
          email === 'zonal@civiceye.com' ? 'Zonal Admin' : 
          email === 'officer@civiceye.com' ? 'Field Worker' : 'Demo Citizen',
        role: mockRole as UserRole,
        phone: '9999999999',
        addresses: [],
        badges: [],
        rewardPoints: 500,
        complaintsCount: 12,
        resolvedCount: 8,
        joinedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginHistory: [],
        isVerified: true,
        twoFactorEnabled: false,
        privacyMode: false,
        language: 'en',
        theme: 'dark',
        fontSize: 'md',
        highContrast: false,
        reducedMotion: false,
        dyslexicFont: false,
        notifications: { push: true, email: true, sms: false, whatsapp: false },
        familyAccounts: [],
        isAnonymousCapable: true
      };
      
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // user will be set automatically by onAuthStateChanged
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password, role, additionalData) => {
    set({ isLoading: true });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        id: firebaseUser.uid,
        email: email,
        name: additionalData.name || '',
        phone: additionalData.phone || '',
        role: role,
        addresses: [],
        badges: [],
        rewardPoints: 0,
        complaintsCount: 0,
        resolvedCount: 0,
        joinedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginHistory: [],
        isVerified: false,
        twoFactorEnabled: false,
        privacyMode: false,
        language: 'en',
        theme: 'dark',
        fontSize: 'md',
        highContrast: false,
        reducedMotion: false,
        dyslexicFont: false,
        notifications: { push: true, email: true, sms: false, whatsapp: false },
        familyAccounts: [],
        isAnonymousCapable: true
      };

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      // User will be updated in state by onAuthStateChanged listener
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyAccount: async () => {
    set({ isLoading: true });
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user logged in");

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        isVerified: true,
      });
      set((state) => ({
        user: state.user ? { ...state.user, isVerified: true } : null,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateRole: async (role) => {
    set({ isLoading: true });
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user logged in");

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        role: role
      });
      set((state) => ({
        user: state.user ? { ...state.user, role: role } : null,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updatePrivacyMode: async (enabled) => {
    set({ isLoading: true });
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user logged in");

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        privacyMode: enabled
      });
      set((state) => ({
        user: state.user ? { ...state.user, privacyMode: enabled } : null,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateUISettings: async (settings) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), settings);
      set((state) => ({
        user: state.user ? { ...state.user, ...settings } : null
      }));
    } catch (error) {
      console.error("Failed to update UI settings in Firestore:", error);
    }
  },

  updateProfile: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null
  })),

  updateAvatar: async (url) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { avatar: url });
      set((state) => ({
        user: state.user ? { ...state.user, avatar: url } : null
      }));
    } catch (error) {
      console.error("Failed to update avatar:", error);
    }
  },

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({ 
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: userData.name || 'Anonymous User',
                phone: userData.phone || '',
                role: userData.role || 'citizen',
                badges: userData.badges || [],
                addresses: userData.addresses || [],
                rewardPoints: userData.rewardPoints || 0,
                complaintsCount: userData.complaintsCount || 0,
                resolvedCount: userData.resolvedCount || 0,
                isVerified: userData.isVerified || false,
                privacyMode: userData.privacyMode || false,
                ...userData
              } as User, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ 
              user: { 
                id: firebaseUser.uid, 
                email: firebaseUser.email || '', 
                name: 'Anonymous User',
                role: 'citizen',
                badges: [],
                addresses: [],
                rewardPoints: 0,
                complaintsCount: 0,
                resolvedCount: 0,
                isVerified: false,
                privacyMode: false,
                phone: '',
                joinedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                loginHistory: [],
                twoFactorEnabled: false,
                language: 'en',
                theme: 'dark',
                fontSize: 'md',
                highContrast: false,
                reducedMotion: false,
                dyslexicFont: false,
                notifications: { push: true, email: true, sms: false, whatsapp: false },
                familyAccounts: [],
                isAnonymousCapable: true
              } as User,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          set({ isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  }
}));

