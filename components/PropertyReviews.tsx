import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, X } from 'lucide-react';
import { PropertyReview, Guest } from '../types';
import { MOCK_GUESTS } from '../mockBookingData';

interface PropertyReviewsProps {
    propertyId: string;
    reviews: PropertyReview[];
    averageRating: number;
}

export const PropertyReviews: React.FC<PropertyReviewsProps> = ({ propertyId, reviews, averageRating }) => {
    const [showAll, setShowAll] = useState(false);

    const getGuest = (guestId: string): Guest | undefined => {
        return MOCK_GUESTS.find(g => g.id === guestId);
    };

    const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

    // Calculate category averages
    const categoryAverages = {
        cleanliness: reviews.reduce((sum, r) => sum + r.cleanliness, 0) / reviews.length,
        accuracy: reviews.reduce((sum, r) => sum + r.accuracy, 0) / reviews.length,
        checkIn: reviews.reduce((sum, r) => sum + r.checkIn, 0) / reviews.length,
        communication: reviews.reduce((sum, r) => sum + r.communication, 0) / reviews.length,
        location: reviews.reduce((sum, r) => sum + r.location, 0) / reviews.length,
        value: reviews.reduce((sum, r) => sum + r.value, 0) / reviews.length,
    };

    return (
        <div className="space-y-6">
            {/* Rating Overview */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Star size={32} fill="currentColor" className="text-yellow-500" />
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{averageRating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reviews.length} reviews</p>
                    </div>

                    {/* Category Ratings */}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        {Object.entries(categoryAverages).map(([category, avg]) => (
                            <div key={category} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-trust-blue dark:bg-blue-400"
                                            style={{ width: `${(avg / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white w-8">{avg.toFixed(1)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {displayedReviews.map(review => {
                    const guest = getGuest(review.guestId);

                    return (
                        <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                            {/* Review Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={guest?.photo || 'https://i.pravatar.cc/150?img=1'}
                                        alt={guest?.name}
                                        className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{guest?.name}</p>
                                        <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={16} fill="currentColor" className="text-yellow-500" />
                                    <span className="font-bold text-gray-900 dark:text-white">{review.rating.toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Review Comment */}
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>

                            {/* Category Ratings */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-xs">
                                    <span className="text-gray-500">Cleanliness</span>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                fill={i < review.cleanliness ? 'currentColor' : 'none'}
                                                className={i < review.cleanliness ? 'text-yellow-500' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="text-xs">
                                    <span className="text-gray-500">Communication</span>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                fill={i < review.communication ? 'currentColor' : 'none'}
                                                className={i < review.communication ? 'text-yellow-500' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="text-xs">
                                    <span className="text-gray-500">Location</span>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                fill={i < review.location ? 'currentColor' : 'none'}
                                                className={i < review.location ? 'text-yellow-500' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Host Response */}
                            {review.hostResponse && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-trust-blue">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Response from host</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{review.hostResponse}</p>
                                </div>
                            )}

                            {/* Helpful Button */}
                            <div className="mt-4 flex items-center gap-4">
                                <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-trust-blue dark:hover:text-blue-400 transition-colors">
                                    <ThumbsUp size={16} />
                                    <span>Helpful ({review.helpful})</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More Button */}
            {reviews.length > 3 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-bold text-gray-700 dark:text-gray-300 hover:border-trust-blue dark:hover:border-blue-400 hover:text-trust-blue dark:hover:text-blue-400 transition-colors"
                >
                    {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                </button>
            )}
        </div>
    );
};

interface ReviewSubmissionFormProps {
    propertyId: string;
    bookingId: string;
    onSubmit: (review: Partial<PropertyReview>) => void;
    onClose: () => void;
}

export const ReviewSubmissionForm: React.FC<ReviewSubmissionFormProps> = ({ propertyId, bookingId, onSubmit, onClose }) => {
    const [ratings, setRatings] = useState({
        cleanliness: 5,
        accuracy: 5,
        checkIn: 5,
        communication: 5,
        location: 5,
        value: 5,
    });
    const [comment, setComment] = useState('');

    const overallRating = Object.values(ratings).reduce((sum, val) => sum + val, 0) / 6;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const review: Partial<PropertyReview> = {
            id: `PR${Date.now()}`,
            propertyId,
            bookingId,
            rating: overallRating,
            ...ratings,
            comment,
            date: new Date().toISOString().split('T')[0],
            helpful: 0
        };

        onSubmit(review);
    };

    const RatingSelector = ({ label, value, onChange }: { label: string; value: number; onChange: (val: number) => void }) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            size={32}
                            fill={star <= value ? 'currentColor' : 'none'}
                            className={star <= value ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}
                        />
                    </button>
                ))}
                <span className="ml-2 font-bold text-gray-900 dark:text-white">{value}/5</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-trust-blue p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold">Write a Review</h3>
                        <p className="text-sm opacity-80 mt-1">Share your experience with future guests</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Overall Rating Display */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Overall Rating</p>
                        <div className="flex items-center justify-center gap-2">
                            <Star size={40} fill="currentColor" className="text-yellow-500" />
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{overallRating.toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Rating Categories */}
                    <div className="space-y-6 mb-6">
                        <RatingSelector
                            label="Cleanliness"
                            value={ratings.cleanliness}
                            onChange={(val) => setRatings({ ...ratings, cleanliness: val })}
                        />
                        <RatingSelector
                            label="Accuracy"
                            value={ratings.accuracy}
                            onChange={(val) => setRatings({ ...ratings, accuracy: val })}
                        />
                        <RatingSelector
                            label="Check-in"
                            value={ratings.checkIn}
                            onChange={(val) => setRatings({ ...ratings, checkIn: val })}
                        />
                        <RatingSelector
                            label="Communication"
                            value={ratings.communication}
                            onChange={(val) => setRatings({ ...ratings, communication: val })}
                        />
                        <RatingSelector
                            label="Location"
                            value={ratings.location}
                            onChange={(val) => setRatings({ ...ratings, location: val })}
                        />
                        <RatingSelector
                            label="Value"
                            value={ratings.value}
                            onChange={(val) => setRatings({ ...ratings, value: val })}
                        />
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share details of your experience..."
                            rows={6}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                        />
                        <p className="text-xs text-gray-500 mt-2">Minimum 50 characters</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={comment.length < 50}
                        className="w-full bg-trust-blue text-white py-4 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Review
                    </button>
                </form>
            </div>
        </div>
    );
};
