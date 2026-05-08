// src/types/complaint.ts
export type ComplaintStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'assigned' 
  | 'in_progress' 
  | 'escalated' 
  | 'resolved' 
  | 'verified' 
  | 'closed' 
  | 'rejected';

export type ComplaintCategory = 
  | 'pothole' 
  | 'garbage' 
  | 'water_leakage' 
  | 'electricity' 
  | 'street_light' 
  | 'drainage' 
  | 'public_safety' 
  | 'other';

export type SeverityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  actor: string;
  actorRole: 'citizen' | 'officer' | 'admin' | 'system';
  note: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'citizen' | 'officer' | 'admin';
  text: string;
  timestamp: string;
  isInternal: boolean; // For officer/admin communication
}

export interface ComplaintLocation {
  lat: number;
  lng: number;
  address: string;
  ward: string;
  wardId: string;
  pincode: string;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
  size: number;
  createdAt: string;
}

export interface Complaint {
  id: string;
  referenceId: string; // e.g. CMP-2024-X8A2
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  severity: SeverityLevel;
  location: ComplaintLocation;
  media: MediaFile[];
  witnesses: { name: string; contact?: string }[];
  timeline: TimelineEvent[];
  comments: Comment[];
  ward: string;
  wardId: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  assignedOfficerId?: string;
  assignedOfficer?: string;
  assignedDepartment?: string;
  isAnonymous: boolean;
  isRecurring: boolean;
  isCommunityReport: boolean;
  societyName?: string;
  upvotes: number;
  tags: string[];
  estimatedResolutionDays: number;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  rewardPoints: number;
}
