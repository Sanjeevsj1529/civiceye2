import { create } from 'zustand';
import { Complaint, ComplaintStatus, ComplaintCategory } from '../types/complaint';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';

interface ComplaintState {
  complaints: Complaint[];
  isLoading: boolean;
  filterStatus: string;
  filterCategory: string;
  searchQuery: string;
  viewMode: 'list' | 'kanban' | 'map' | 'calendar';
  
  initializeComplaints: () => (() => void);
  setFilter: (key: 'filterStatus' | 'filterCategory' | 'searchQuery', value: string) => void;
  setViewMode: (mode: 'list' | 'kanban' | 'map' | 'calendar') => void;
  addComplaint: (complaint: Partial<Complaint>) => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, citizenId: string, referenceId: string, note?: string, assignedOfficerId?: string) => Promise<void>;
  upvoteComplaint: (id: string, userId: string) => Promise<void>;
  echoComplaint: (id: string, userId: string) => Promise<void>;
  addComment: (id: string, text: string, authorId: string, authorName: string, authorRole: string, citizenId: string, referenceId: string) => Promise<void>;
  getFilteredComplaints: () => Complaint[];
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  isLoading: true,
  filterStatus: 'all',
  filterCategory: 'all',
  searchQuery: '',
  viewMode: 'list',

  initializeComplaints: () => {
    set({ isLoading: true });
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaints = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Complaint[];
      
      set({ complaints, isLoading: false });
    }, (error) => {
      console.error("Error listening to complaints:", error);
      set({ isLoading: false });
    });

    return unsubscribe;
  },

  setFilter: (key, value) => set({ [key]: value }),
  setViewMode: (viewMode) => set({ viewMode }),

  addComplaint: async (complaintData) => {
    try {
      const newComplaint = {
        ...complaintData,
        status: 'submitted',
        upvotes: 0,
        comments: [],
        isCommunityReport: complaintData.isCommunityReport || false,
        societyName: complaintData.societyName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [{
          id: `t_${Date.now()}`,
          status: 'submitted',
          timestamp: new Date().toISOString(),
          actor: 'System',
          actorRole: 'system',
          note: 'Complaint successfully filed.'
        }],
        reposts: [],
        echoCount: 0,
        socialPriority: 0
      };
      
      await addDoc(collection(db, 'complaints'), newComplaint);
    } catch (error) {
      console.error("Error adding complaint:", error);
      throw error;
    }
  },

  updateComplaintStatus: async (id, status, citizenId, referenceId, note, assignedOfficerId) => {
    try {
      const complaintRef = doc(db, 'complaints', id);
      const timestamp = new Date().toISOString();
      
      const newTimelineEntry = {
        id: `t_${Date.now()}`,
        status,
        timestamp,
        actor: 'Admin', // In real app, get from auth context
        actorRole: 'admin',
        note: note || `Status updated to ${status.replace('_', ' ')}`
      };

      const complaints = get().complaints;
      const target = complaints.find(c => c.id === id);
      if (!target) return;

      const updateData: any = {
        status,
        updatedAt: timestamp,
        timeline: [...target.timeline, newTimelineEntry]
      };

      if (assignedOfficerId) {
        updateData.assignedOfficerId = assignedOfficerId;
        updateData.assignedOfficer = 'Inspector Ramesh Kumar'; // Mocked name for now
      }

      await updateDoc(complaintRef, updateData);

      // Reward Citizen if resolved
      if (status === 'resolved') {
        await updateDoc(doc(db, 'users', citizenId), {
          rewardPoints: increment(100),
          resolvedCount: increment(1)
        });
      }

      // Add Notification for Citizen
      await addDoc(collection(db, 'notifications'), {
        userId: citizenId,
        title: 'Status Updated',
        message: `Your complaint ${referenceId} is now ${status.replace('_', ' ')}.`,
        type: 'status_change',
        referenceId: referenceId,
        isRead: false,
        createdAt: serverTimestamp()
      });

      // Add Notification for Officer if assigned
      if (status === 'assigned' && assignedOfficerId) {
        await addDoc(collection(db, 'notifications'), {
          userId: assignedOfficerId,
          title: 'New Task Assigned',
          message: `You have been assigned to complaint ${referenceId}.`,
          type: 'status_change',
          referenceId: referenceId,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  },

  upvoteComplaint: async (id, userId) => {
    try {
      const complaintRef = doc(db, 'complaints', id);
      const complaints = get().complaints;
      const target = complaints.find(c => c.id === id);
      if (!target) return;

      const upvotes = (target as any).upvotes || 0;
      const upvoters = (target as any).upvoters || [];
      
      if (upvoters.includes(userId)) return; // Prevent double upvote

      const newUpvotes = upvotes + 1;
      const newPriority = (newUpvotes * 2) + ((target as any).echoCount || 0) * 5;

      await updateDoc(complaintRef, {
        upvotes: newUpvotes,
        upvoters: [...upvoters, userId],
        socialPriority: newPriority
      });
    } catch (error) {
      console.error("Error upvoting:", error);
      throw error;
    }
  },

  echoComplaint: async (id, userId) => {
    try {
      const complaintRef = doc(db, 'complaints', id);
      const complaints = get().complaints;
      const target = complaints.find(c => c.id === id);
      if (!target) return;

      const echoCount = (target as any).echoCount || 0;
      const echoers = (target as any).echoers || [];
      
      if (echoers.includes(userId)) return;

      const newEchoCount = echoCount + 1;
      const newPriority = ((target as any).upvotes || 0) * 2 + (newEchoCount * 5);

      await updateDoc(complaintRef, {
        echoCount: newEchoCount,
        echoers: [...echoers, userId],
        socialPriority: newPriority
      });
    } catch (error) {
      console.error("Error echoing:", error);
      throw error;
    }
  },

  addComment: async (id, text, authorId, authorName, authorRole, citizenId, referenceId) => {
    try {
      const complaintRef = doc(db, 'complaints', id);
      const complaints = get().complaints;
      const target = complaints.find(c => c.id === id);
      if (!target) return;

      const newComment = {
        id: `cm_${Date.now()}`,
        authorId,
        authorName,
        authorRole,
        text,
        timestamp: new Date().toISOString(),
        isInternal: authorRole !== 'citizen'
      };

      await updateDoc(complaintRef, {
        comments: [...target.comments, newComment]
      });

      // Notify citizen if comment is from officer/admin
      if (authorRole !== 'citizen') {
        await addDoc(collection(db, 'notifications'), {
          userId: citizenId,
          title: 'New Response',
          message: `${authorName} commented on your report ${referenceId}.`,
          type: 'comment',
          referenceId: referenceId,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  getFilteredComplaints: () => {
    const { complaints, filterStatus, filterCategory, searchQuery } = get();
    return complaints.filter(c => {
      const statusMatch = filterStatus === 'all' || c.status === filterStatus;
      const categoryMatch = filterCategory === 'all' || c.category === filterCategory;
      const searchMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.referenceId.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && categoryMatch && searchMatch;
    });
  }
}));
