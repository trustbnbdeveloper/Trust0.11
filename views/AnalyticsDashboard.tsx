import React, { useState } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Calendar, DollarSign, Users, TrendingUp, TrendingDown,
    Download, Filter, ChevronDown, MapPin, Activity
} from 'lucide-react';
import { MOCK_ANALYTICS_DATA } from '../mockAnalyticsData';

export const AnalyticsDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState('12m');
    const [selectedProperty, setSelectedProperty] = useState('all');

    const { revenue, occupancy, bookings, guests } = MOCK_ANALYTICS_DATA;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                    <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                            {entry.name}: {entry.value.toLocaleString()}
                            {entry.name === 'Revenue' ? '€' : ''}
                            {entry.name === 'Occupancy' ? '%' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track your property performance and growth
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-trust-blue/20"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="12m">Last 12 Months</option>
                            <option value="ytd">Year to Date</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-trust-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue KPI */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-bold ${revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {revenue.growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {Math.abs(revenue.growth)}%
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        €{revenue.total.toLocaleString()}
                    </h3>
                </div>

                {/* Occupancy KPI */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Activity size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-bold ${occupancy.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {occupancy.growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {Math.abs(occupancy.growth)}%
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Occupancy Rate</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {occupancy.overall}%
                    </h3>
                </div>

                {/* Bookings KPI */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Calendar size={24} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-bold ${bookings.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {bookings.growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {Math.abs(bookings.growth)}%
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Bookings</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {bookings.total}
                    </h3>
                </div>

                {/* Guests KPI */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Users size={24} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-trust-blue">
                            <Activity size={16} />
                            {guests.satisfaction}/5.0
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Guests</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {guests.total}
                    </h3>
                </div>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenue.byMonth}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0B1C2D" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0B1C2D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => `€${value / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    name="Revenue"
                                    stroke="#0B1C2D"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Occupancy Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Occupancy Rate</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={occupancy.byMonth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="rate"
                                    name="Occupancy"
                                    fill="#2FA36B"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Funnel */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Booking Conversion</h3>
                    <div className="space-y-6">
                        {bookings.funnel.map((stage, idx) => (
                            <div key={stage.stage} className="relative">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{stage.stage}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{stage.count.toLocaleString()}</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-trust-blue rounded-full transition-all duration-1000"
                                        style={{ width: `${(stage.count / bookings.funnel[0].count) * 100}%` }}
                                    />
                                </div>
                                {idx < bookings.funnel.length - 1 && (
                                    <p className="text-xs text-red-500 mt-1 text-right">
                                        {stage.dropoff}% dropoff
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue by Property */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue by Property</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Property</th>
                                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Revenue</th>
                                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Share</th>
                                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenue.byProperty.map((prop, idx) => (
                                    <tr key={prop.propertyId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{prop.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                                            €{prop.amount.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-trust-blue rounded-full"
                                                        style={{ width: `${prop.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{prop.percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="flex items-center justify-end gap-1 text-green-600 text-xs font-bold">
                                                <TrendingUp size={14} />
                                                +{Math.floor(Math.random() * 20) + 5}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
