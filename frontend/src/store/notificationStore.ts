import { create } from 'zustand';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_change' | 'comment' | 'system';
  referenceId: string;
  isRead: boolean;
  createdAt: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  initializeNotifications: (userId: string, role: string, wardId?: string) => () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  initializeNotifications: (userId, role, wardId) => {
    set({ isLoading: true });
    
    // Demo Mode: Inject mock notifications for the bypass user
    if (userId === 'demo_user_id') {
      const mockNotifications: Notification[] = [
        {
          id: 'mock_1',
          userId: 'demo_user_id',
          title: 'Welcome to CivicEye! 👁️',
          message: 'Your account is ready. Start reporting issues to improve your city!',
          type: 'system',
          referenceId: '',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: 'mock_2',
          userId: 'demo_user_id',
          title: 'Reward Points Earned! ✨',
          message: 'You earned 500 points for your contribution to the community.',
          type: 'system',
          referenceId: '',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: 'mock_3',
          userId: 'demo_user_id',
          title: 'Report Status Update 🚧',
          message: 'The pothole report in North Ward has been assigned to a Field Officer.',
          type: 'status_change',
          referenceId: 'demo_report_1',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        }
      ];
      set({ notifications: mockNotifications, unreadCount: 2, isLoading: false });
      return () => {}; // No-op unsubscribe for demo
    }

    // Define the channels this user should listen to
    const channels = [userId, 'admin_global'];
    if (role === 'admin') {
      channels.push('admin_global');
    }
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', channels)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Sort in memory to avoid needing a composite index in Firestore
      notifications.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toDate?.()?.getTime() || (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    }, (error) => {
      console.error("Error listening to notifications:", error);
      set({ isLoading: false });
    });

    return unsubscribe;
  },

  markAsRead: async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    try {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => 
        updateDoc(doc(db, 'notifications', n.id), { isRead: true })
      ));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  },

  addNotification: async (data) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...data,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  }
}));
