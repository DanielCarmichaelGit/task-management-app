"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./Button";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : new Date()
  );
  const [inputValue, setInputValue] = useState(value || "");
  const [viewMode, setViewMode] = useState<"calendar" | "month" | "year">(
    "calendar"
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  // Initialize with today's date if no value
  useEffect(() => {
    if (!value) {
      const today = new Date();
      setSelectedDate(today);
      setCurrentMonth(today);
      setInputValue(today.toISOString().split("T")[0]);
    } else {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentMonth(date);
      setInputValue(value);
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setViewMode("calendar");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isSameMonth = (date1: Date, date2: Date) => {
    return (
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentMonth(date);
    const formattedDate = formatDate(date);
    setInputValue(formattedDate);
    onChange(formattedDate);
    setIsOpen(false);
    setViewMode("calendar");
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    const formattedDate = formatDate(today);
    setInputValue(formattedDate);
    onChange(formattedDate);
    setIsOpen(false);
    setViewMode("calendar");
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const years = Array.from(
    { length: 21 },
    (_, i) => new Date().getFullYear() - 10 + i
  );

  return (
    <div className="relative" ref={pickerRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${className}`}
          readOnly
          disabled={disabled}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 min-w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-600">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("month")}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700 p-2"
              >
                {monthNames[currentMonth.getMonth()]}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("year")}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700 p-2"
              >
                {currentMonth.getFullYear()}
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700 p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-700 p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === "calendar" && (
            <>
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 p-4 pb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-slate-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 px-4 pb-4">
                {getDaysInMonth(currentMonth).map((date, index) => (
                  <div key={index} className="text-center">
                    {date ? (
                      <button
                        type="button"
                        onClick={() => handleDateSelect(date)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          isSelected(date)
                            ? "bg-blue-600 text-white"
                            : isToday(date)
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : isSameMonth(date, currentMonth)
                            ? "text-slate-200 hover:bg-slate-700 hover:text-white"
                            : "text-slate-500"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <div className="w-8 h-8" />
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-600">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}

          {/* Month View */}
          {viewMode === "month" && (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), index, 1)
                      );
                      setViewMode("calendar");
                    }}
                    className="p-3 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Year View */}
          {viewMode === "year" && (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(
                        new Date(year, currentMonth.getMonth(), 1)
                      );
                      setViewMode("calendar");
                    }}
                    className={`p-3 text-sm font-medium rounded-lg transition-colors ${
                      year === currentMonth.getFullYear()
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
