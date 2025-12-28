import { PropertyReview, GuestReview } from './types';

export const MOCK_PROPERTY_REVIEWS: PropertyReview[] = [
    {
        id: 'PR001',
        propertyId: '1',
        guestId: 'G001',
        bookingId: 'BK001',
        rating: 4.9,
        cleanliness: 5,
        accuracy: 5,
        checkIn: 5,
        communication: 5,
        location: 4,
        value: 5,
        comment: 'Absolutely stunning villa! The sea view was breathtaking and the property was even better than the photos. Host was very responsive and helpful. Only minor issue was the WiFi speed, but everything else was perfect. Highly recommend for families!',
        date: '2024-09-23',
        helpful: 12
    },
    {
        id: 'PR002',
        propertyId: '2',
        guestId: 'G002',
        bookingId: 'BK002',
        rating: 4.7,
        cleanliness: 5,
        accuracy: 4,
        checkIn: 5,
        communication: 5,
        location: 5,
        value: 4,
        comment: 'Great location in the heart of Tirana! Walking distance to everything. The apartment was clean and modern. Check-in was smooth. A bit pricey but worth it for the location.',
        date: '2024-08-31',
        helpful: 8
    },
    {
        id: 'PR003',
        propertyId: '1',
        guestId: 'G003',
        bookingId: 'BK004',
        rating: 5.0,
        cleanliness: 5,
        accuracy: 5,
        checkIn: 5,
        communication: 5,
        location: 5,
        value: 5,
        comment: 'Perfect property for a work retreat. Fast WiFi, comfortable workspace, and stunning views. The host went above and beyond to ensure we had everything we needed. Will definitely book again!',
        date: '2024-07-18',
        hostResponse: 'Thank you Hans! It was a pleasure hosting you. Looking forward to welcoming you back!',
        helpful: 15
    },
    {
        id: 'PR004',
        propertyId: '3',
        guestId: 'G001',
        bookingId: 'BK004',
        rating: 4.6,
        cleanliness: 4,
        accuracy: 5,
        checkIn: 5,
        communication: 5,
        location: 4,
        value: 5,
        comment: 'Nice property with good amenities. Kids loved the pool. A few minor maintenance issues but host addressed them quickly. Good value for money.',
        date: '2024-07-18',
        helpful: 6
    }
];

export const MOCK_GUEST_REVIEWS: GuestReview[] = [
    {
        id: 'GR001',
        guestId: 'G001',
        propertyId: '1',
        hostId: '1',
        bookingId: 'BK001',
        rating: 5.0,
        communication: 5,
        cleanliness: 5,
        houseRules: 5,
        wouldHostAgain: true,
        comment: 'Excellent guest! Very respectful of the property and house rules. Left the place spotless. Great communication throughout. Would love to host John again!',
        date: '2024-09-23'
    },
    {
        id: 'GR002',
        guestId: 'G002',
        propertyId: '2',
        hostId: '2',
        bookingId: 'BK002',
        rating: 4.5,
        communication: 5,
        cleanliness: 4,
        houseRules: 4,
        wouldHostAgain: true,
        comment: 'Nice guest, good communication. Left the apartment in good condition. Minor delay on checkout but overall a pleasant experience.',
        date: '2024-08-31'
    },
    {
        id: 'GR003',
        guestId: 'G003',
        propertyId: '1',
        hostId: '1',
        bookingId: 'BK004',
        rating: 5.0,
        communication: 5,
        cleanliness: 5,
        houseRules: 5,
        wouldHostAgain: true,
        comment: 'Perfect guest! Professional, clean, and respectful. Treated the property like their own. Highly recommend to other hosts.',
        date: '2024-07-18'
    }
];
