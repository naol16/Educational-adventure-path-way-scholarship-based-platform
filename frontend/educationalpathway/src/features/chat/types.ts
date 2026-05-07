export interface ChatUser {
  id: number;
  name: string;
  role: string;
  email?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: ChatUser;
  parentId?: number | null;
}

export interface Conversation {
  id: number;
  createdAt: string;
  updatedAt: string;
  isGroup: boolean;
  name?: string;
  country?: string;
  description?: string;
  users?: ChatUser[]; // Legacy
  members?: ChatUser[]; // New
  chatMessages?: Message[];
  messages?: Message[];
  ChatMessages?: Message[];
  unreadCount?: number;
}
