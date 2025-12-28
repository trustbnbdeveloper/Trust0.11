
import { Property, FinancialRecord, Owner, SecurityLog, MaintenanceTask, BlogPost, LocalGuideTrip, StaffProfile, PropertyExpense, UtilityBill, Booking, Guest, PropertyReview, GuestReview, User, UserRole } from './types';
import { MOCK_BOOKINGS as BOOKINGS_DATA } from './mockBookingData';

export const MOCK_BOOKINGS: Booking[] = BOOKINGS_DATA;

export const MOCK_USERS: User[] = [
  {
    id: 'ADMIN_01',
    name: 'Admin User',
    email: 'admin@trustbnb.com',
    role: UserRole.ADMIN,
    joinDate: '2023-01-01',
    wishlist: [],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 'GUEST_01',
    name: 'Alice Guest',
    email: 'alice@example.com',
    role: UserRole.GUEST,
    joinDate: '2023-05-15',
    wishlist: ['1', '3'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
  }
];

export const COLORS = {
  blue: '#0B1C2D',
  gray: '#F2F4F6',
  beige: '#E6DED3',
  green: '#2FA36B',
  white: '#FFFFFF',
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    ownerId: '1', // Arben
    name: 'Villa Saranda Breeze',
    location: 'Sarandë, Albania',
    category: 'Coastal',
    status: 'Active',
    qualityScore: 98,
    occupancyRate: 85,
    monthlyRevenue: 3200,
    nextGuest: 'Aug 14 - John D.',
    imgUrl: 'https://picsum.photos/400/300?random=1',
    images: [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=101',
      'https://picsum.photos/800/600?random=102',
      'https://picsum.photos/800/600?random=103',
    ],
    channels: ['Airbnb', 'Booking', 'Direct'],
    coordinates: { x: 45, y: 88 }, // South
    pricePerNight: 180,
    amenities: ['Pool', 'Sea View', 'WiFi', 'Smart Lock']
  },
  {
    id: '2',
    ownerId: '2', // Elona
    name: 'Tirana City Penthouse',
    location: 'Blloku, Tirana',
    category: 'Urban',
    status: 'Maintenance',
    qualityScore: 92,
    occupancyRate: 78,
    monthlyRevenue: 1850,
    nextGuest: 'Aug 18 - Sarah M.',
    imgUrl: 'https://picsum.photos/400/300?random=2',
    images: [
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=201',
      'https://picsum.photos/800/600?random=202',
    ],
    channels: ['Airbnb', 'Direct'],
    coordinates: { x: 42, y: 45 }, // Central
    pricePerNight: 95,
    amenities: ['City View', 'Gym', 'Workspace', 'Concierge']
  },
  {
    id: '3',
    ownerId: '3', // Ilir
    name: 'Vlora Seafront Apt',
    location: 'Lungomare, Vlorë',
    category: 'Coastal',
    status: 'Active',
    qualityScore: 95,
    occupancyRate: 60,
    monthlyRevenue: 2100,
    nextGuest: 'Aug 12 - Family K.',
    imgUrl: 'https://picsum.photos/400/300?random=3',
    images: [
      'https://picsum.photos/800/600?random=3',
      'https://picsum.photos/800/600?random=301',
      'https://picsum.photos/800/600?random=302',
    ],
    channels: ['Booking', 'Direct'],
    coordinates: { x: 35, y: 65 }, // South West
    pricePerNight: 120,
    amenities: ['Beachfront', 'Balcony', 'Parking', 'AC']
  },
  {
    id: '4',
    ownerId: '1', // Arben
    name: 'Ksamil Stone Villa',
    location: 'Ksamil, Albania',
    category: 'Coastal',
    status: 'Active',
    qualityScore: 99,
    occupancyRate: 92,
    monthlyRevenue: 4500,
    nextGuest: 'Aug 20 - Marco P.',
    imgUrl: 'https://picsum.photos/400/300?random=5',
    images: [
      'https://picsum.photos/800/600?random=5',
      'https://picsum.photos/800/600?random=501',
      'https://picsum.photos/800/600?random=502',
      'https://picsum.photos/800/600?random=503',
    ],
    channels: ['Airbnb', 'Booking'],
    coordinates: { x: 46, y: 92 }, // Deep South
    pricePerNight: 250,
    amenities: ['Private Beach', 'Chef', 'Jacuzzi', 'Garden']
  },
  {
    id: '5',
    ownerId: '1', // Arben
    name: 'Durres Port View',
    location: 'Durrës, Albania',
    category: 'Coastal',
    status: 'Onboarding',
    qualityScore: 88,
    occupancyRate: 0,
    monthlyRevenue: 0,
    nextGuest: null,
    imgUrl: 'https://picsum.photos/400/300?random=6',
    images: [
      'https://picsum.photos/800/600?random=6',
      'https://picsum.photos/800/600?random=601',
    ],
    channels: ['Direct'],
    coordinates: { x: 38, y: 42 }, // Central West
    pricePerNight: 85,
    amenities: ['Port View', 'Elevator', 'Modern', 'Netflix']
  }
];

export const MOCK_TASKS: MaintenanceTask[] = [
  {
    id: 'T1',
    propertyId: '2',
    title: 'Kitchen Cabinet Renovation',
    status: 'In Progress',
    priority: 'High',
    type: 'Renovation',
    costEstimate: 1200,
    dateScheduled: '2024-08-15'
  },
  {
    id: 'T2',
    propertyId: '1',
    title: 'AC Filter Replacement',
    status: 'Pending',
    priority: 'Medium',
    type: 'Repair',
    costEstimate: 80,
    dateScheduled: '2024-08-20'
  },
  {
    id: 'T3',
    propertyId: '3',
    title: 'Deep Cleaning (End of Season)',
    status: 'Completed',
    priority: 'Low',
    type: 'Cleaning',
    costEstimate: 150,
    dateScheduled: '2024-08-10'
  }
];

export const MOCK_OWNERS: Owner[] = [
  {
    id: '1',
    name: 'Arben Kastrati',
    email: 'arben.kastrati@example.ch',
    phone: '+41 79 123 45 67',
    location: 'Zurich, Switzerland',
    propertyCount: 3,
    status: 'Active',
    joinDate: 'Jan 15, 2023',
    avatarInitials: 'AK',
    accountBalance: 8450,
    totalRevenue: 12500,
    totalExpenses: 4050
  },
  {
    id: '2',
    name: 'Elona Dushku',
    email: 'elona.d@example.de',
    phone: '+49 151 987 65 43',
    location: 'Munich, Germany',
    propertyCount: 1,
    status: 'Active',
    joinDate: 'Mar 22, 2023',
    avatarInitials: 'ED',
    accountBalance: 1320,
    totalRevenue: 1850,
    totalExpenses: 530
  },
  {
    id: '3',
    name: 'Ilir Beqiri',
    email: 'ilir.b@example.co.uk',
    phone: '+44 7700 900123',
    location: 'London, UK',
    propertyCount: 2,
    status: 'Inactive',
    joinDate: 'Nov 05, 2022',
    avatarInitials: 'IB',
    accountBalance: 0,
    totalRevenue: 5200,
    totalExpenses: 1850
  },
  {
    id: '4',
    name: 'Teuta Vllasi',
    email: 'teuta.v@example.com',
    phone: '+1 212 555 0199',
    location: 'New York, USA',
    propertyCount: 1,
    status: 'Active',
    joinDate: 'Jun 10, 2023',
    avatarInitials: 'TV',
    accountBalance: 2100,
    totalRevenue: 3200,
    totalExpenses: 1100
  }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Investing in Albanian Tourism: 2024 Outlook',
    excerpt: 'Why the southern coast is becoming the next Mediterranean hotspot for property investors. An analysis of growth trends.',
    content: 'Full article content here...\n\nAlbania is seeing unprecedented growth in tourism numbers...',
    author: 'Arber Xhaferi',
    publishDate: '2024-07-15',
    status: 'Published',
    coverImage: 'https://picsum.photos/800/600?random=20',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'TrustBnB Quality Standards: What Owners Need to Know',
    excerpt: 'A deep dive into our 60-point inspection checklist and how it boosts occupancy and ADR.',
    content: 'Quality is the cornerstone of trust. Our 60-point checklist ensures every property meets international standards...',
    author: 'Elira K.',
    publishDate: '2024-08-02',
    status: 'Draft',
    coverImage: 'https://picsum.photos/800/600?random=21',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'Tax Compliance for Diaspora Owners',
    excerpt: 'Navigating the new fiscal laws for non-resident property owners in Albania.',
    content: 'Understanding your tax obligations is crucial. Recent changes in the law affect how rental income is taxed...',
    author: 'Legal Team',
    publishDate: '2024-06-20',
    status: 'Published',
    coverImage: 'https://picsum.photos/800/600?random=22',
    readTime: '12 min read'
  }
];

export const MOCK_TRANSACTIONS: FinancialRecord[] = [
  { id: '1', date: '2023-08-01', description: 'Booking #AB829 - Villa Saranda', amount: 850, type: 'Credit', category: 'Booking', hash: '0x8f2a...9d1' },
  { id: '2', date: '2023-08-02', description: 'Cleaning Fee - Tirana Penthouse', amount: 40, type: 'Debit', category: 'Maintenance', hash: '0x1b4c...2e8' },
  { id: '3', date: '2023-08-03', description: 'TrustBnB Commission (20%)', amount: 170, type: 'Debit', category: 'Fee', hash: '0x9a3d...5f2' },
  { id: '4', date: '2023-08-05', description: 'Monthly Payout - July', amount: 2450, type: 'Debit', category: 'Payout', hash: '0x7c1e...8b4' },
];

export const MOCK_SECURITY_LOGS: SecurityLog[] = [
  { id: '1', timestamp: '2024-08-14 09:42:11', actor: 'System Core', action: 'Ledger Integrity Check', ipAddress: '10.0.0.1 (Internal)', hash: '0x882...A12', status: 'Verified' },
  { id: '2', timestamp: '2024-08-14 09:15:22', actor: 'Arben Kastrati', action: 'Session Handshake (MFA)', ipAddress: '192.168.1.45 (Zurich)', hash: '0x7B1...C99', status: 'Verified' },
  { id: '3', timestamp: '2024-08-14 08:30:05', actor: 'Admin: Elira', action: 'Payout Approval', ipAddress: '192.168.2.10 (Tirana)', hash: '0x5A2...F33', status: 'Verified' },
  { id: '4', timestamp: '2024-08-14 03:12:00', actor: 'Auto-Bot', action: 'E2E Key Rotation', ipAddress: 'System', hash: '0x112...B44', status: 'Verified' },
];

export const MOCK_STAFF: StaffProfile[] = [
  {
    id: 'S1',
    name: 'Besnik Hoxha',
    type: 'Handyman',
    location: 'Durrës',
    photo: 'https://i.pravatar.cc/150?u=S1',
    phone: '+355 69 123 4567',
    whatsapp: 'https://wa.me/355691234567',
    address: 'Rruga Pavarësia, Durrës',
    hourlyRate: 25,
    skills: ['Plumbing', 'Electrical', 'Painting'],
    rating: 4.8,
    completedTasks: 142
  },
  {
    id: 'S2',
    name: 'Anila Murati',
    type: 'Cleaner',
    location: 'Durrës',
    photo: 'https://i.pravatar.cc/150?u=S2',
    phone: '+355 68 765 4321',
    whatsapp: 'https://wa.me/355687654321',
    address: 'Lagjia 13, Plazh, Durrës',
    hourlyRate: 15,
    rating: 4.9,
    completedTasks: 310
  },
  {
    id: 'S3',
    name: 'Genti Zeneli',
    type: 'Handyman',
    location: 'Tirana',
    photo: 'https://i.pravatar.cc/150?u=S3',
    phone: '+355 67 222 3333',
    whatsapp: 'https://wa.me/355672223333',
    address: 'Rruga Myslym Shyri, Tirana',
    hourlyRate: 30,
    skills: ['HVAC', 'Carpentry', 'General Maintenance'],
    rating: 4.7,
    completedTasks: 89
  },
  {
    id: 'S4',
    name: 'Luljeta Krasniqi',
    type: 'Cleaner',
    location: 'Sarandë',
    photo: 'https://i.pravatar.cc/150?u=S4',
    phone: '+355 69 444 5555',
    whatsapp: 'https://wa.me/355694445555',
    address: 'Rruga Butrinti, Sarandë',
    hourlyRate: 18,
    rating: 5.0,
    completedTasks: 215
  },
  {
    id: 'S5',
    name: 'Arber Dema',
    type: 'Handyman',
    location: 'Sarandë',
    photo: 'https://i.pravatar.cc/150?u=S5',
    phone: '+355 68 555 6666',
    whatsapp: 'https://wa.me/355685556666',
    address: 'Lagjia 4, Sarandë',
    hourlyRate: 22,
    skills: ['Locksmith', 'Tiling', 'Roofing'],
    rating: 4.6,
    completedTasks: 56
  }
];

export const REVENUE_DATA = [
  { name: 'Jan', revenue: 1200 },
  { name: 'Feb', revenue: 1400 },
  { name: 'Mar', revenue: 1100 },
  { name: 'Apr', revenue: 2100 },
  { name: 'May', revenue: 2800 },
  { name: 'Jun', revenue: 3500 },
  { name: 'Jul', revenue: 4100 },
];

// --- New Mock Trips ---
export const MOCK_TRIPS: LocalGuideTrip[] = [
  {
    id: 'trip1',
    title: 'The Perfect Day in Saranda',
    category: 'Culture',
    description: 'Experience the history and sunset of Saranda in one perfectly curated loop.',
    image: 'https://picsum.photos/800/600?random=10',
    duration: '6 Hours',
    rating: 4.9,
    distance: '5km total',
    featured: true,
    stops: [
      { time: '09:00', title: 'Morning Coffee at Komiteti', description: 'Start with traditional Turkish coffee and museum artifacts.', location: 'Rruga e Flamurit', type: 'Food' },
      { time: '10:30', title: 'Synagogue Complex Ruins', description: 'Explore the 5th-century mosaics in the heart of town.', location: 'Center', type: 'Culture' },
      { time: '12:30', title: 'Seafood Lunch at Haxhi', description: 'Fresh catch of the day at a family-run gem.', location: 'Rruga Mitat Hoxha', type: 'Food' },
      { time: '17:30', title: 'Sunset at Lekursi Castle', description: 'Take a taxi up for the best panoramic view of Corfu.', location: 'Lekursi Hill', type: 'View' },
    ]
  },
  {
    id: 'trip2',
    title: 'Hidden Beaches of Ksamil',
    category: 'Relaxation',
    description: 'Avoid the crowds. A guide to the secluded spots accessible by foot or boat.',
    image: 'https://picsum.photos/800/600?random=15',
    duration: 'Full Day',
    rating: 4.8,
    distance: '15km drive',
    featured: true,
    stops: [
      { time: '10:00', title: 'Mirror Beach (Pasqyra)', description: 'Crystal clear waters, arrive early to get a spot.', location: 'North Ksamil', type: 'Activity' },
      { time: '13:00', title: 'Boat to Twin Islands', description: 'Rent a small boat or kayak to reach the uninhabited islets.', location: 'Ksamil Beach', type: 'Activity' },
      { time: '16:00', title: 'Late Lunch at Guvat', description: 'Mediterranean cuisine with a view of the islands.', location: 'Ksamil Center', type: 'Food' },
    ]
  },
  {
    id: 'trip3',
    title: 'Butrint National Park History',
    category: 'Adventure',
    description: 'A deep dive into the UNESCO World Heritage site with a guided route.',
    image: 'https://picsum.photos/800/600?random=12',
    duration: '4 Hours',
    rating: 5.0,
    distance: '20km drive',
    stops: [
      { time: '09:00', title: 'Venetian Tower Entry', description: 'Begin your journey at the entrance near the ferry.', location: 'Butrint Entrance', type: 'Culture' },
      { time: '10:00', title: 'Great Basilica', description: 'Walk through the early Christian ruins.', location: 'Butrint Park', type: 'Culture' },
      { time: '11:00', title: 'The Ancient Theater', description: 'The highlight of the park, dating back to 3rd century BC.', location: 'Butrint Park', type: 'View' },
      { time: '12:30', title: 'Museum Castle', description: 'Visit the museum housed within the acropolis castle.', location: 'Hilltop', type: 'Culture' },
    ]
  },
  {
    id: 'trip4',
    title: 'Saranda Gastronomy Tour',
    category: 'Dining',
    description: 'A culinary journey through local flavors, from Byrek to Raki.',
    image: 'https://picsum.photos/800/600?random=11',
    duration: '3 Hours',
    rating: 4.7,
    distance: 'Walking',
    stops: [
      { time: '18:00', title: 'Byrek Te Çimi', description: 'Taste the best spinach and cheese pie in town.', location: 'Market Area', type: 'Food' },
      { time: '19:00', title: 'Local Market Visit', description: 'See where the locals buy olives, cheese, and spices.', location: 'Tregu', type: 'Culture' },
      { time: '20:00', title: 'Dinner at Taverna Laberia', description: 'Authentic grilled meat and traditional yogurt sauce.', location: 'Rruga Lefter Talo', type: 'Food' },
    ]
  }
];

export const MOCK_EXPENSES: PropertyExpense[] = [
  {
    id: 'EXP-001',
    propertyId: '2',
    ownerId: '2',
    type: 'Maintenance',
    description: 'Kitchen Cabinet Renovation',
    amount: 1200,
    date: '2024-08-15',
    status: 'Approved',
    staffId: 'S3'
  },
  {
    id: 'EXP-002',
    propertyId: '1',
    ownerId: '1',
    type: 'Cleaning',
    description: 'Deep Cleaning Service',
    amount: 85,
    date: '2024-08-18',
    status: 'Paid',
    staffId: 'S4'
  },
  {
    id: 'EXP-003',
    propertyId: '1',
    ownerId: '1',
    type: 'Utility',
    category: 'Electricity',
    description: 'Electricity Bill - August 2024',
    amount: 145,
    date: '2024-08-01',
    status: 'Paid'
  },
  {
    id: 'EXP-004',
    propertyId: '5',
    ownerId: '1',
    type: 'Utility',
    category: 'Water',
    description: 'Water Bill - August 2024',
    amount: 42,
    date: '2024-08-01',
    status: 'Pending'
  },
  {
    id: 'EXP-005',
    propertyId: '2',
    ownerId: '2',
    type: 'Utility',
    category: 'Internet',
    description: 'Fiber Internet - Monthly',
    amount: 35,
    date: '2024-08-05',
    status: 'Paid'
  }
];

export const MOCK_UTILITY_BILLS: UtilityBill[] = [
  {
    id: 'UTIL-001',
    propertyId: '1',
    ownerId: '1',
    utilityType: 'Electricity',
    provider: 'OSHEE Albania',
    amount: 145,
    billingPeriod: 'August 2024',
    dueDate: '2024-09-10',
    status: 'Paid',
    meterReading: '12458 kWh'
  },
  {
    id: 'UTIL-002',
    propertyId: '2',
    ownerId: '2',
    utilityType: 'Water',
    provider: 'UKT Tirana',
    amount: 28,
    billingPeriod: 'August 2024',
    dueDate: '2024-09-15',
    status: 'Paid',
    meterReading: '245 m³'
  },
  {
    id: 'UTIL-003',
    propertyId: '1',
    ownerId: '1',
    utilityType: 'Internet',
    provider: 'Vodafone Albania',
    amount: 25,
    billingPeriod: 'August 2024',
    dueDate: '2024-09-01',
    status: 'Paid'
  },
  {
    id: 'UTIL-004',
    propertyId: '5',
    ownerId: '1',
    utilityType: 'Electricity',
    provider: 'OSHEE Albania',
    amount: 92,
    billingPeriod: 'August 2024',
    dueDate: '2024-09-10',
    status: 'Pending',
    meterReading: '8234 kWh'
  },
  {
    id: 'UTIL-005',
    propertyId: '3',
    ownerId: '3',
    utilityType: 'Water',
    provider: 'UKV Vlorë',
    amount: 35,
    billingPeriod: 'August 2024',
    dueDate: '2024-08-25',
    status: 'Overdue',
    meterReading: '189 m³'
  }
];