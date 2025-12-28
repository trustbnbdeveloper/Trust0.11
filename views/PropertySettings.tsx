import React, { useState } from 'react';
import {
    DollarSign, Users, Calendar, Save, Trash2,
    RefreshCw, CheckCircle, AlertCircle, Link, TrendingUp
} from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';
import { PricingRules, CalendarSync } from '../types';

export const PropertySettings: React.FC = () => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(MOCK_PROPERTIES[0].id);
    const [properties, setProperties] = useState(MOCK_PROPERTIES);

    // Find current property
    const property = properties.find(p => p.id === selectedPropertyId) || properties[0];

    // Local state for form editing
    const [pricing, setPricing] = useState<PricingRules>(property.pricing || {
        basePrice: property.pricePerNight || 100,
        baseGuests: 2,
        extraGuestFee: 25,
        weekendMultiplier: 1.2,
        weeklyDiscount: 10,
        seasonalRules: [],
        dynamicConfig: {
            enabled: false,
            occupancyPremium: 1.2,
            occupancyThreshold: 80,
            lastMinuteDiscount: 0.9,
            earlyBirdDiscount: 0.95
        }
    });

    const [calendarFeeds, setCalendarFeeds] = useState<CalendarSync[]>(property.calendarFeeds || [
        {
            id: 'S001',
            source: 'Airbnb',
            url: 'https://airbnb.com/calendar/ical/12345.ics',
            lastSynced: new Date().toISOString(),
            status: 'active'
        }
    ]);

    const [newFeedUrl, setNewFeedUrl] = useState('');
    const [newFeedSource, setNewFeedSource] = useState<'Airbnb' | 'Booking.com'>('Airbnb');

    const handleSavePricing = () => {
        // Mock save
        const updatedProperties = properties.map(p =>
            p.id === selectedPropertyId
                ? { ...p, pricing: pricing }
                : p
        );
        setProperties(updatedProperties);
        alert('Pricing rules updated successfully!');
    };

    const handleAddFeed = () => {
        if (!newFeedUrl) return;

        const newFeed: CalendarSync = {
            id: `S${Date.now()}`,
            source: newFeedSource,
            url: newFeedUrl,
            lastSynced: new Date().toISOString(),
            status: 'active'
        };

        setCalendarFeeds([...calendarFeeds, newFeed]);
        setNewFeedUrl('');
    };

    const handleRemoveFeed = (id: string) => {
        setCalendarFeeds(calendarFeeds.filter(f => f.id !== id));
    };

    const handleSyncNow = (id: string) => {
        // Mock sync
        const updatedFeeds = calendarFeeds.map(f =>
            f.id === id
                ? { ...f, lastSynced: new Date().toISOString(), status: 'active' as const }
                : f
        );
        setCalendarFeeds(updatedFeeds);
        alert('Calendar synced successfully!');
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Property Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage pricing and calendar synchronization</p>
                </div>

                <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Dynamic Pricing Config */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="text-trust-blue" />
                            Dynamic Pricing
                        </h2>
                        <button
                            onClick={handleSavePricing}
                            className="flex items-center gap-2 px-4 py-2 bg-trust-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            <Save size={16} />
                            Save Rules
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Price (per night)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                    <input
                                        type="number"
                                        value={pricing.basePrice}
                                        onChange={(e) => setPricing({ ...pricing, basePrice: parseInt(e.target.value) })}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Guests</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Users size={16} /></span>
                                    <input
                                        type="number"
                                        value={pricing.baseGuests}
                                        onChange={(e) => setPricing({ ...pricing, baseGuests: parseInt(e.target.value) })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Extra Guest Fee</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                    <input
                                        type="number"
                                        value={pricing.extraGuestFee}
                                        onChange={(e) => setPricing({ ...pricing, extraGuestFee: parseInt(e.target.value) })}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">/ guest / night</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weekend Multiplier</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">x</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={pricing.weekendMultiplier}
                                        onChange={(e) => setPricing({ ...pricing, weekendMultiplier: parseFloat(e.target.value) })}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seasons Configuration */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Seasonal Rules</h3>
                                <button
                                    onClick={() => {
                                        const newRule = {
                                            id: `SE${Date.now()}`, name: 'New Season',
                                            startMonth: 5, startDay: 1, endMonth: 7, endDay: 31, multiplier: 1.5
                                        };
                                        setPricing({ ...pricing, seasonalRules: [...(pricing.seasonalRules || []), newRule] });
                                    }}
                                    className="p-1 px-2 bg-gray-200 dark:bg-gray-600 rounded text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                >
                                    + Add Season
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(!pricing.seasonalRules || pricing.seasonalRules.length === 0) && (
                                    <p className="text-xs text-gray-500 italic">No seasonal rules. Prices will be static.</p>
                                )}
                                {pricing.seasonalRules?.map((rule, idx) => (
                                    <div key={rule.id} className="flex gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                                        <input
                                            value={rule.name}
                                            onChange={(e) => {
                                                const updatedRules = [...(pricing.seasonalRules || [])];
                                                updatedRules[idx].name = e.target.value;
                                                setPricing({ ...pricing, seasonalRules: updatedRules });
                                            }}
                                            className="w-1/3 px-2 py-1 text-xs border rounded dark:bg-gray-900 dark:border-gray-700"
                                            placeholder="Name"
                                        />
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <span>x</span>
                                            <input
                                                type="number" step="0.1" value={rule.multiplier}
                                                onChange={(e) => {
                                                    const updatedRules = [...(pricing.seasonalRules || [])];
                                                    updatedRules[idx].multiplier = parseFloat(e.target.value);
                                                    setPricing({ ...pricing, seasonalRules: updatedRules });
                                                }}
                                                className="w-12 px-1 py-1 border rounded dark:bg-gray-900 dark:border-gray-700"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const updatedRules = pricing.seasonalRules?.filter((_, i) => i !== idx);
                                                setPricing({ ...pricing, seasonalRules: updatedRules });
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Airline Dynamic Pricing */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                    <TrendingUp size={16} className="text-blue-500" />
                                    Dynamic Availability Pricing
                                </h3>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        name="toggle"
                                        id="toggle"
                                        checked={pricing.dynamicConfig?.enabled || false}
                                        onChange={(e) => setPricing({
                                            ...pricing,
                                            dynamicConfig: {
                                                ...(pricing.dynamicConfig || { occupancyPremium: 1.2, occupancyThreshold: 80, lastMinuteDiscount: 0.9, earlyBirdDiscount: 0.95 }),
                                                enabled: e.target.checked
                                            }
                                        })}
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        style={{ right: pricing.dynamicConfig?.enabled ? '0' : 'auto', left: pricing.dynamicConfig?.enabled ? 'auto' : '0' }}
                                    />
                                    <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${pricing.dynamicConfig?.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}></label>
                                </div>
                            </div>

                            {pricing.dynamicConfig?.enabled && (
                                <div className="space-y-4 text-xs">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">Occupancy Premium (Demand)</span>
                                            <span className="font-bold text-blue-600">x{pricing.dynamicConfig.occupancyPremium}</span>
                                        </div>
                                        <p className="text-gray-500 mb-2">Apply premium if occupancy {'>'} {pricing.dynamicConfig.occupancyThreshold}%</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">Last Minute Discount (Lead Time)</span>
                                            <span className="font-bold text-green-600">x{pricing.dynamicConfig.lastMinuteDiscount}</span>
                                        </div>
                                        <p className="text-gray-500 mb-2">Apply discount if booking {'<'} 3 days out</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Preview Calculation</h3>
                            <p className="text-xs text-gray-500 mb-4">Example: 4 Guests for a Friday night</p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Base Rate (x{pricing.weekendMultiplier})</span>
                                    <span>€{(pricing.basePrice * pricing.weekendMultiplier).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Extra Guests ({4 - pricing.baseGuests} x €{pricing.extraGuestFee})</span>
                                    <span>+€{((4 - pricing.baseGuests) * pricing.extraGuestFee).toFixed(0)}</span>
                                </div>
                                {pricing.dynamicConfig?.enabled && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>Dynamic Factors</span>
                                        <span>Active</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                                    <span>Nightly Total</span>
                                    <span>€{((pricing.basePrice * pricing.weekendMultiplier) + ((4 - pricing.baseGuests) * pricing.extraGuestFee)).toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Sync Config */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="text-trust-blue" />
                            Calendar Sync
                        </h2>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Add Feed */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Add iCal Feed</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <select
                                        value={newFeedSource}
                                        onChange={(e) => setNewFeedSource(e.target.value as any)}
                                        className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
                                    >
                                        <option value="Airbnb">Airbnb</option>
                                        <option value="Booking.com">Booking.com</option>
                                        <option value="Vrbo">Vrbo</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={newFeedUrl}
                                        onChange={(e) => setNewFeedUrl(e.target.value)}
                                        placeholder="Paste .ics URL here..."
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleAddFeed}
                                    disabled={!newFeedUrl}
                                    className="w-full py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                                >
                                    Connect Calendar
                                </button>
                            </div>
                        </div>

                        {/* Feed List */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">Connected Calendars</h3>
                            {calendarFeeds.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No calendars connected.</p>
                            ) : (
                                calendarFeeds.map(feed => (
                                    <div key={feed.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${feed.source === 'Airbnb' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">{feed.source}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    {feed.status === 'active' ? (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle size={10} /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600">
                                                            <AlertCircle size={10} /> Error
                                                        </span>
                                                    )}
                                                    <span>• Synced {new Date(feed.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleSyncNow(feed.id)}
                                                className="p-2 text-gray-500 hover:text-trust-blue transition-colors"
                                                title="Sync Now"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFeed(feed.id)}
                                                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Export URL */}
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Export Calendar</h3>
                            <p className="text-xs text-gray-500 mb-3">Copy this URL to import bookings into other platforms.</p>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={`https://trustbnb.com/ical/${property.id}`}
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400"
                                />
                                <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <Link size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
