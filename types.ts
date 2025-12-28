export enum UserRole {
  PUBLIC = 'PUBLIC',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  HOST = 'HOST',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  joinDate: string;
  wishlist: string[]; // Array of Property IDs
  isFirstBooking?: boolean;
}

export interface SeasonalRule {
  id: string;
  name: string;
  startMonth: number; // 0-11
  startDay: number;
  endMonth: number;
  endDay: number;
  multiplier: number;
}

export interface DynamicPricingConfig {
  enabled: boolean;
  occupancyPremium: number; // e.g. 1.2 for high demand
  occupancyThreshold: number; // e.g. 80%
  lastMinuteDiscount: number; // e.g. 0.9 for < 3 days
  earlyBirdDiscount: number; // e.g. 0.9 for > 60 days
}

export interface PricingRules {
  basePrice: number;
  baseGuests: number;
  extraGuestFee: number;
  weekendMultiplier: number;
  weeklyDiscount: number;
  seasonalRules?: SeasonalRule[]; // New
  dynamicConfig?: DynamicPricingConfig; // New
}

export interface CalendarSync {
  id: string;
  source: 'Airbnb' | 'Booking.com' | 'Vrbo' | 'Other';
  url: string;
  lastSynced: string;
  status: 'active' | 'error';
}

export interface Property {
  id: string;
  ownerId?: string; // Link to Owner
  name: string;
  location: string;
  category: 'Coastal' | 'Urban' | 'Mountain';
  status: 'Active' | 'Maintenance' | 'Onboarding' | 'Review';
  qualityScore: number;
  occupancyRate: number;
  monthlyRevenue: number;
  nextGuest: string | null;
  imgUrl: string;
  images?: string[]; // New field for gallery
  channels: ('Airbnb' | 'Booking' | 'Direct')[];
  coordinates?: { x: number; y: number }; // Percentage based for custom map (0-100)
  pricePerNight?: number; // Legacy simple price, kept for compatibility
  pricing?: PricingRules; // New advanced pricing
  calendarFeeds?: CalendarSync[]; // New sync feeds
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  description?: string;
  rating?: number;
  reviewCount?: number;
  instantBook?: boolean;
  superhost?: boolean;
  propertyType?: 'Apartment' | 'Villa' | 'Studio' | 'House';
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  propertyCount: number;
  status: 'Active' | 'Inactive';
  joinDate: string;
  avatarInitials: string;
  accountBalance?: number;
  totalRevenue?: number;
  totalExpenses?: number;
}

export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  category: 'Booking' | 'Maintenance' | 'Fee' | 'Payout';
  hash?: string; // For immutable ledger visualization
}

export interface MaintenanceTask {
  id: string;
  propertyId: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  type: 'Renovation' | 'Repair' | 'Cleaning';
  costEstimate: number;
  dateScheduled: string;
  assignedStaffId?: string;
  actualCost?: number;
}

export interface StaffProfile {
  id: string;
  name: string;
  type: 'Cleaner' | 'Handyman';
  location: string;
  photo: string;
  phone: string;
  whatsapp: string;
  address: string;
  hourlyRate: number;
  skills?: string[];
  rating: number;
  completedTasks: number;
}

export interface PropertyExpense {
  id: string;
  propertyId: string;
  ownerId: string;
  type: 'Maintenance' | 'Cleaning' | 'Utility' | 'Other';
  category?: 'Electricity' | 'Water' | 'Internet' | 'Gas';
  description: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Paid';
  invoiceUrl?: string;
  staffId?: string;
}

export interface UtilityBill {
  id: string;
  propertyId: string;
  ownerId: string;
  utilityType: 'Electricity' | 'Water' | 'Internet' | 'Gas';
  provider: string;
  amount: number;
  billingPeriod: string;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  meterReading?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  verified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  memberSince: string;
  languages: string[];
  bio?: string;
  location?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  totalPrice: number;
  nightlyRate: number;
  cleaningFee: number;
  serviceFee: number;
  status: 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  specialRequests?: string;
  createdAt: string;
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  guestId: string;
  bookingId: string;
  rating: number;
  cleanliness: number;
  accuracy: number;
  checkIn: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
  date: string;
  hostResponse?: string;
  helpful: number;
}

export interface GuestReview {
  id: string;
  guestId: string;
  propertyId: string;
  hostId: string;
  bookingId: string;
  rating: number;
  communication: number;
  cleanliness: number;
  houseRules: number;
  wouldHostAgain: boolean;
  comment: string;
  date: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  ipAddress: string;
  hash: string;
  status: 'Verified' | 'Flagged';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  status: 'Published' | 'Draft' | 'Archived';
  coverImage: string;
  readTime: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface DirectMessage {
  id: string;
  text: string; // Stored encrypted
  imageUrl?: string; // Base64 image
  sender: 'admin' | 'owner';
  timestamp: Date;
  read: boolean;
  isEncrypted: boolean;
}

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'SYSTEM';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  timestamp: string;
  read: boolean;
  priority?: 'High' | 'Normal';
  source?: 'Airbnb' | 'Booking' | 'Direct';
}

// --- New Types for Local Guide ---
export interface GuideStop {
  time: string;
  title: string;
  description: string;
  location: string;
  type: 'Food' | 'View' | 'Activity' | 'Transport' | 'Culture';
}

export interface LocalGuideTrip {
  id: string;
  title: string;
  category: 'Dining' | 'Culture' | 'Adventure' | 'Relaxation';
  description: string;
  image: string;
  duration: string;
  rating: number;
  distance: string;
  stops: GuideStop[];
  featured?: boolean;
}

export type Language = 'en' | 'sq' | 'it' | 'el' | 'mk' | 'es';
export type Theme = 'light' | 'dark';