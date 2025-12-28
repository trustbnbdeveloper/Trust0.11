
export const MOCK_ANALYTICS_DATA = {
    revenue: {
        total: 128500,
        growth: 15.2,
        byMonth: [
            { month: 'Jan', amount: 8500 },
            { month: 'Feb', amount: 9200 },
            { month: 'Mar', amount: 10500 },
            { month: 'Apr', amount: 11800 },
            { month: 'May', amount: 12500 },
            { month: 'Jun', amount: 15800 },
            { month: 'Jul', amount: 18500 },
            { month: 'Aug', amount: 19200 },
            { month: 'Sep', amount: 14500 },
            { month: 'Oct', amount: 11200 },
            { month: 'Nov', amount: 9800 },
            { month: 'Dec', amount: 12500 } // Projected
        ],
        byProperty: [
            { propertyId: '1', name: 'Villa Saranda Breeze', amount: 48500, percentage: 37.7 },
            { propertyId: '2', name: 'Tirana City Penthouse', amount: 32200, percentage: 25.1 },
            { propertyId: '3', name: 'Green Coast Resort Villa', amount: 28800, percentage: 22.4 },
            { propertyId: '4', name: 'Durrës Beachfront Apt', amount: 19000, percentage: 14.8 }
        ]
    },
    occupancy: {
        overall: 78,
        growth: 5.4,
        byMonth: [
            { month: 'Jan', rate: 45 },
            { month: 'Feb', rate: 48 },
            { month: 'Mar', rate: 55 },
            { month: 'Apr', rate: 65 },
            { month: 'May', rate: 72 },
            { month: 'Jun', rate: 88 },
            { month: 'Jul', rate: 95 },
            { month: 'Aug', rate: 92 },
            { month: 'Sep', rate: 82 },
            { month: 'Oct', rate: 65 },
            { month: 'Nov', rate: 52 },
            { month: 'Dec', rate: 68 }
        ],
        byProperty: [
            { propertyId: '1', name: 'Villa Saranda Breeze', rate: 85 },
            { propertyId: '2', name: 'Tirana City Penthouse', rate: 72 },
            { propertyId: '3', name: 'Green Coast Resort Villa', rate: 81 },
            { propertyId: '4', name: 'Durrës Beachfront Apt', rate: 68 }
        ]
    },
    bookings: {
        total: 142,
        growth: 12.8,
        details: {
            confirmed: 118,
            pending: 8,
            cancelled: 16
        },
        funnel: [
            { stage: 'Property Views', count: 12500, dropoff: 0 },
            { stage: 'Booking Initiated', count: 850, dropoff: 93.2 },
            { stage: 'Details Entered', count: 420, dropoff: 50.6 },
            { stage: 'Payment', count: 185, dropoff: 55.9 },
            { stage: 'Confirmed', count: 142, dropoff: 23.2 }
        ],
        sources: [
            { source: 'Direct Website', count: 65, percentage: 45 },
            { source: 'Airbnb', count: 45, percentage: 32 },
            { source: 'Booking.com', count: 22, percentage: 15 },
            { source: 'Referral', count: 10, percentage: 8 }
        ]
    },
    guests: {
        total: 385,
        new: 256,
        returning: 129,
        satisfaction: 4.85,
        demographics: [
            { country: 'Germany', count: 85 },
            { country: 'Italy', count: 62 },
            { country: 'UK', count: 58 },
            { country: 'USA', count: 45 },
            { country: 'Albania', count: 42 },
            { country: 'Other', count: 93 }
        ]
    }
};
