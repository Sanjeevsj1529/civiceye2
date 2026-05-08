import { Complaint, ComplaintCategory, ComplaintStatus } from '../types/complaint';
import { Officer } from '../types/officer';
import { User } from '../types/user';
import { Ward } from '../types/officer';
import { subDays, subHours, subMinutes } from 'date-fns';

export const CATEGORY_META: Record<ComplaintCategory, { label: string; icon: string; color: string }> = {
  pothole: { label: 'Pothole', icon: '🕳️', color: 'bg-amber-500' },
  garbage: { label: 'Garbage', icon: '🗑️', color: 'bg-emerald-500' },
  water_leakage: { label: 'Water Leakage', icon: '💧', color: 'bg-blue-500' },
  electricity: { label: 'Electricity', icon: '⚡', color: 'bg-yellow-500' },
  street_light: { label: 'Street Light', icon: '💡', color: 'bg-indigo-500' },
  drainage: { label: 'Drainage', icon: '🌊', color: 'bg-cyan-500' },
  public_safety: { label: 'Public Safety', icon: '🛡️', color: 'bg-rose-500' },
  other: { label: 'Other', icon: '❓', color: 'bg-slate-500' },
};

export const STATUS_META: Record<ComplaintStatus, { label: string; bg: string; color: string }> = {
  submitted: { label: 'Submitted', bg: 'bg-blue-500/10', color: 'text-blue-400' },
  under_review: { label: 'Under Review', bg: 'bg-indigo-500/10', color: 'text-indigo-400' },
  assigned: { label: 'Assigned', bg: 'bg-cyan-500/10', color: 'text-cyan-400' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-500/10', color: 'text-amber-400' },
  escalated: { label: 'Escalated', bg: 'bg-rose-500/10', color: 'text-rose-400' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
  verified: { label: 'Verified', bg: 'bg-green-500/20', color: 'text-green-400' },
  closed: { label: 'Closed', bg: 'bg-slate-500/10', color: 'text-slate-400' },
  rejected: { label: 'Rejected', bg: 'bg-red-500/10', color: 'text-red-400' },
};

// --- Mock Wards ---
export const WARDS: Ward[] = [
  { id: 'w1', name: 'North Ward', bounds: [], totalComplaints: 120, resolvedComplaints: 98, slaComplianceRate: 92, population: 45000, officerCount: 12 },
  { id: 'w2', name: 'South Ward', bounds: [], totalComplaints: 85, resolvedComplaints: 70, slaComplianceRate: 88, population: 38000, officerCount: 10 },
  { id: 'w3', name: 'East Ward', bounds: [], totalComplaints: 150, resolvedComplaints: 110, slaComplianceRate: 75, population: 52000, officerCount: 15 },
  { id: 'w4', name: 'West Ward', bounds: [], totalComplaints: 95, resolvedComplaints: 82, slaComplianceRate: 90, population: 41000, officerCount: 11 },
  { id: 'w5', name: 'Central Ward', bounds: [], totalComplaints: 210, resolvedComplaints: 160, slaComplianceRate: 82, population: 65000, officerCount: 20 },
];

// --- Mock Officers ---
export const OFFICERS: Officer[] = [
  {
    id: 'o1', name: 'Inspector Ramesh Kumar', badge: 'CE-9821', department: 'Roads & Works', 
    wardId: 'w5', wardName: 'Central Ward', status: 'on_duty', lastActive: new Date().toISOString(),
    metrics: { totalAssigned: 45, totalResolved: 42, avgResolutionTime: 18, onTimeRate: 95, satisfactionScore: 4.8, escalationRate: 2, currentWorkload: 65 }
  },
  {
    id: 'o2', name: 'Officer Priya Sharma', badge: 'CE-7732', department: 'Sanitation', 
    wardId: 'w1', wardName: 'North Ward', status: 'on_duty', lastActive: new Date().toISOString(),
    metrics: { totalAssigned: 38, totalResolved: 35, avgResolutionTime: 24, onTimeRate: 92, satisfactionScore: 4.6, escalationRate: 5, currentWorkload: 78 }
  },
  {
    id: 'o3', name: 'Sgt. Vikram Singh', badge: 'CE-1120', department: 'Electricity', 
    wardId: 'w3', wardName: 'East Ward', status: 'off_duty', lastActive: subHours(new Date(), 2).toISOString(),
    metrics: { totalAssigned: 52, totalResolved: 40, avgResolutionTime: 36, onTimeRate: 78, satisfactionScore: 4.2, escalationRate: 15, currentWorkload: 90 }
  }
];

// --- Mock User ---
export const MOCK_USER: User = {
  id: 'u1', name: 'Arjun Mehra', email: 'arjun@example.com', phone: '9876543210', role: 'citizen',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  addresses: [{ label: 'Home', address: 'Plot 42, Sector 12, Dwarka, Delhi', isDefault: true }],
  badges: [
    { id: 'b1', name: 'First Responder', icon: '🎯', earnedAt: subDays(new Date(), 30).toISOString() },
    { id: 'b2', name: 'Civic Hero', icon: '🦸', earnedAt: subDays(new Date(), 5).toISOString() }
  ],
  rewardPoints: 450, complaintsCount: 12, resolvedCount: 9, joinedAt: subDays(new Date(), 60).toISOString(),
  lastLoginAt: new Date().toISOString(), loginHistory: [], isVerified: true, aadhaarVerified: true,
  twoFactorEnabled: false, privacyMode: false, language: 'en', theme: 'dark', fontSize: 'md',
  highContrast: false, reducedMotion: false, dyslexicFont: false,
  notifications: { push: true, email: true, sms: false, whatsapp: true },
  familyAccounts: [], isAnonymousCapable: true
};

// --- Mock Complaints (50 entries) ---
const categories: ComplaintCategory[] = ['pothole', 'garbage', 'water_leakage', 'electricity', 'street_light', 'drainage', 'public_safety'];
const statuses: ComplaintStatus[] = ['submitted', 'under_review', 'assigned', 'in_progress', 'escalated', 'resolved', 'verified'];

export const COMPLAINTS: Complaint[] = Array.from({ length: 50 }).map((_, i) => {
  const category = categories[i % categories.length];
  const status = statuses[i % statuses.length];
  const ward = WARDS[i % WARDS.length];
  const date = subDays(new Date(), i % 30);
  
  return {
    id: `c_${i}`,
    referenceId: `CMP-2024-${1000 + i}`,
    title: `${CATEGORY_META[category].label} problem at Sector ${Math.floor(Math.random() * 20) + 1}`,
    description: `There is a persistent ${category} issue here that needs immediate attention. It has been affecting the local residents for several days.`,
    category,
    status,
    severity: (Math.floor(Math.random() * 10) + 1) as any,
    location: {
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
      address: `Street ${i + 1}, Block ${String.fromCharCode(65 + (i % 6))}, ${ward.name}, Delhi`,
      ward: ward.name,
      wardId: ward.id,
      pincode: `1100${10 + (i % 90)}`
    },
    media: [
      { id: 'm1', url: 'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&q=80&w=400', type: 'image', name: 'photo1.jpg', size: 1024 * 1024, createdAt: date.toISOString() }
    ],
    witnesses: [],
    timeline: [
      { id: 't1', status: 'submitted', timestamp: date.toISOString(), actor: 'Arjun Mehra', actorRole: 'citizen', note: 'Complaint filed via mobile app' }
    ],
    comments: [],
    ward: ward.name,
    wardId: ward.id,
    citizenId: 'u1',
    citizenName: 'Arjun Mehra',
    citizenPhone: '9876543210',
    upvotes: Math.floor(Math.random() * 50),
    tags: [category, ward.name.toLowerCase().replace(' ', '_')],
    estimatedResolutionDays: 3,
    slaDeadline: subDays(new Date(), -3).toISOString(),
    createdAt: date.toISOString(),
    updatedAt: subMinutes(new Date(), i * 10).toISOString(),
    rewardPoints: 25,
    isAnonymous: Math.random() > 0.8,
    isRecurring: Math.random() > 0.9,
    isCommunityReport: i % 7 === 0,
    societyName: i % 7 === 0 ? `${ward.name} Residents Association` : undefined,
  };
});

export const TESTIMONIALS = [
  { id: 't1', name: 'Rahul Verma', role: 'Citizen', text: 'The response time for the pothole report was amazing. Fixed in 48 hours!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
  { id: 't2', name: 'Officer Priya', role: 'Field Officer', text: 'CivicEye helps me prioritize my tasks efficiently. Real-time tracking is a game changer.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
  { id: 't3', name: 'Anita Desai', role: 'Citizen', text: 'I love how I can track every step of the resolution process. Transparency at its best.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita' },
];
