import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label: string;
    placeholder?: string;
    minDate?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, label, placeholder = "Select date", minDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
    const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateClick = (day: number) => {
        const month = viewDate.getMonth();
        const year = viewDate.getFullYear();
        // Format: YYYY-MM-DD
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const days = [];

        // Empty slots
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} />);
        }

        // Days
        for (let i = 1; i <= totalDays; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isSelected = value === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const isDisabled = minDate ? dateStr < minDate : false;

            days.push(
                <button
                    key={i}
                    onClick={() => !isDisabled && handleDateClick(i)}
                    disabled={isDisabled}
                    className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
                        ${isSelected
                            ? 'bg-trust-blue text-white font-bold shadow-md'
                            : isDisabled
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                        ${!isSelected && isToday ? 'border border-trust-blue text-trust-blue' : ''}
                    `}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
            <div
                className="relative cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <input
                    type="text"
                    readOnly
                    value={value || ''}
                    placeholder={placeholder}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue/20 cursor-pointer"
                />
                <CalendarIcon size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="font-bold text-gray-900 dark:text-white">
                            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {renderDays()}
                    </div>
                </div>
            )}
        </div>
    );
};
