
import { UserRole } from './types';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: 'admin' | 'guest';
    content: string;
    timestamp: string;
    read: boolean;
    type: 'text' | 'image' | 'system';
}

export interface Conversation {
    id: string;
    guestId: string;
    guestName: string;
    guestPhoto?: string;
    guestEmail: string;
    bookingId?: string;
    propertyName?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status: 'open' | 'resolved' | 'archived';
    category: 'booking' | 'support' | 'inquiry';
}

export const MOCK_QUICK_REPLIES = [
    { id: '1', title: 'Check-in Instructions', content: 'Hi {guest_name}, here are the check-in instructions: The key code is 1234. You can check in anytime after 3 PM.' },
    { id: '2', title: 'WiFi Info', content: 'The WiFi network is "TrustBnB_Guest" and the password is "Welcome2025".' },
    { id: '3', title: 'House Rules', content: 'Just a reminder of our house rules: No parties, no smoking inside, and quiet hours are from 10 PM to 7 AM.' },
    { id: '4', title: 'Checkout Confirmation', content: 'Thanks for staying with us! Please leave the keys on the table and lock the door behind you. Safe travels!' },
    { id: '5', title: 'Booking Received', content: 'Hi {guest_name}, thanks for your booking! We have received your request and will confirm it shortly.' }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'C001',
        guestId: 'G001',
        guestName: 'John Smith',
        guestPhoto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        guestEmail: 'john.smith@example.com',
        bookingId: 'BK001',
        propertyName: 'Villa Saranda Breeze',
        lastMessage: 'Is there a coffee maker in the villa?',
        lastMessageTime: '2025-12-20T10:15:00',
        unreadCount: 1,
        status: 'open',
        category: 'inquiry'
    },
    {
        id: 'C002',
        guestId: 'G002',
        guestName: 'Maria Garcia',
        guestPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        guestEmail: 'maria.g@example.com',
        bookingId: 'BK002',
        propertyName: 'Tirana City Penthouse',
        lastMessage: 'Perfect, thank you for the info!',
        lastMessageTime: '2025-12-19T18:30:00',
        unreadCount: 0,
        status: 'resolved',
        category: 'booking'
    },
    {
        id: 'C003',
        guestId: 'G003',
        guestName: 'Hans Mueller',
        guestPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        guestEmail: 'hans.m@example.com',
        bookingId: 'BK004',
        propertyName: 'Green Coast Resort Villa',
        lastMessage: 'Can we check in early?',
        lastMessageTime: '2025-12-18T09:45:00',
        unreadCount: 0,
        status: 'open',
        category: 'inquiry'
    }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
    'C001': [
        {
            id: 'M101',
            conversationId: 'C001',
            senderId: 'G001',
            senderName: 'John Smith',
            senderRole: 'guest',
            content: 'Hi, I just booked the Villa Saranda Breeze for next week.',
            timestamp: '2025-12-20T10:10:00',
            read: true,
            type: 'text'
        },
        {
            id: 'M102',
            conversationId: 'C001',
            senderId: 'G001',
            senderName: 'John Smith',
            senderRole: 'guest',
            content: 'Is there a coffee maker in the villa?',
            timestamp: '2025-12-20T10:15:00',
            read: false,
            type: 'text'
        }
    ],
    'C002': [
        {
            id: 'M201',
            conversationId: 'C002',
            senderId: 'ADMIN',
            senderName: 'Support Team',
            senderRole: 'admin',
            content: 'Hi Maria, just checking if you need directions to the penthouse?',
            timestamp: '2025-12-19T18:00:00',
            read: true,
            type: 'text'
        },
        {
            id: 'M202',
            conversationId: 'C002',
            senderId: 'G002',
            senderName: 'Maria Garcia',
            senderRole: 'guest',
            content: 'No thanks, I have Google Maps. See you tomorrow!',
            timestamp: '2025-12-19T18:30:00',
            read: true,
            type: 'text'
        }
    ],
    'C003': [
        {
            id: 'M301',
            conversationId: 'C003',
            senderId: 'G003',
            senderName: 'Hans Mueller',
            senderRole: 'guest',
            content: 'Hello, our flight arrives early at 10 AM.',
            timestamp: '2025-12-18T09:40:00',
            read: true,
            type: 'text'
        },
        {
            id: 'M302',
            conversationId: 'C003',
            senderId: 'G003',
            senderName: 'Hans Mueller',
            senderRole: 'guest',
            content: 'Can we check in early around 12 PM?',
            timestamp: '2025-12-18T09:45:00',
            read: true,
            type: 'text'
        }
    ]
};
