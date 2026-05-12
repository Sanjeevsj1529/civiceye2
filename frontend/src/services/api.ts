import { Complaint, ComplaintStatus } from '../types/complaint';
import { COMPLAINTS, OFFICERS } from '../utils/mockData';
import { User, UserRole } from '../types/user';
import { Officer } from '../types/officer';

/**
 * CivicEye API Service
 * 
 * This service acts as the gateway for all data fetching. 
 * Currently, it uses mock data and simulated delays to mimic real API behavior.
 * In the future, replace these implementations with real 'fetch' or 'axios' calls.
 */

const SIMULATED_DELAY = 800;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // --- Auth ---
  async login(emailOrPhone: string, role: UserRole): Promise<User> {
    await delay(SIMULATED_DELAY);
    // Return mock user based on role
    return {
      id: 'u1',
      name: 'Demo User',
      email: emailOrPhone,
      phone: '9876543210',
      role,
      addresses: [],
      badges: [],
      rewardPoints: 100,
      complaintsCount: 5,
      resolvedCount: 3,
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
      notifications: { push: true, email: true, sms: false, whatsapp: true },
      familyAccounts: [],
      isAnonymousCapable: true
    };
  },

  // --- Complaints ---
  async getComplaints(): Promise<Complaint[]> {
    await delay(SIMULATED_DELAY);
    return COMPLAINTS;
  },

  async getComplaintById(id: string): Promise<Complaint | undefined> {
    await delay(SIMULATED_DELAY);
    return COMPLAINTS.find(c => c.id === id || c.referenceId === id);
  },

  async createComplaint(data: Partial<Complaint>): Promise<Complaint> {
    await delay(SIMULATED_DELAY * 1.5);
    const newComplaint = {
      ...data,
      id: `c_${Date.now()}`,
      referenceId: `CMP-2024-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Complaint;
    return newComplaint;
  },

  async updateComplaintStatus(id: string, status: ComplaintStatus): Promise<void> {
    await delay(SIMULATED_DELAY);
    // In a real app, this would be a PATCH request
    console.log(`Updated complaint ${id} to status ${status}`);
  },

  // --- Officers ---
  async getOfficers(): Promise<Officer[]> {
    await delay(SIMULATED_DELAY);
    return OFFICERS;
  },

  // --- Analytics ---
  async getStats(): Promise<any> {
    await delay(SIMULATED_DELAY);
    return {
      totalComplaints: COMPLAINTS.length,
      resolvedToday: 4,
      filedToday: 12,
      resolvedThisWeek: 28,
      pendingComplaints: COMPLAINTS.filter(c => c.status !== 'resolved').length,
      escalatedComplaints: COMPLAINTS.filter(c => c.status === 'escalated').length,
      avgResolutionDays: 3.5,
      citizenSatisfaction: 4.8,
      slaComplianceRate: 92
    };
  }
};
