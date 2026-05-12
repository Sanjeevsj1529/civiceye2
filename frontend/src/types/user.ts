// src/types/user.ts
export type UserRole = 'citizen' | 'admin' | 'officer' | 'zonal_admin' | 'super_admin';

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  addresses: { label: string; address: string; isDefault: boolean }[];
  badges: UserBadge[];
  rewardPoints: number;
  complaintsCount: number;
  resolvedCount: number;
  joinedAt: string;
  lastLoginAt: string;
  loginHistory: { timestamp: string; ip: string; device: string }[];
  isVerified: boolean;
  twoFactorEnabled: boolean;
  privacyMode: boolean; // For anonymous by default
  language: 'en' | 'hi';
  theme: 'dark' | 'light' | 'system';
  fontSize: 'sm' | 'md' | 'lg';
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexicFont: boolean;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  familyAccounts: { name: string; relation: string; id: string }[];
  isAnonymousCapable: boolean;
  rtl?: boolean;
  wardId?: string; // For Zonal Admins & Officers
  wardName?: string;
  department?: string; // For Officers
}
