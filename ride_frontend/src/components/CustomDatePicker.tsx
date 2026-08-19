import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  minDate?: string; // YYYY-MM-DD
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CustomDatePicker({
  value,
  onChange,
  minDate,
  placeholder = "Select Date",
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to current date
  const parsedDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      if (!Number.isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Compute days in month grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const minDateObj = minDate ? new Date(minDate + "T00:00:00") : null;
  const todayStr = new Date().toISOString().slice(0, 10);

  const formatDisplay = (val: string) => {
    if (!val) return "";
    const d = new Date(val + "T00:00:00");
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelectDay = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(todayStr);
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Input trigger container */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass-input flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all hover:border-primary/50"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
          <span className={`text-sm truncate ${value ? "text-ink font-medium" : "text-ink-variant/50"}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-ink-variant/50 hover:text-ink hover:bg-ink/5 transition-colors"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 left-0 sm:left-auto right-0 sm:right-auto w-72 rounded-2xl glass-strong border border-white/80 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            boxShadow: "0 20px 48px rgba(46, 123, 255, 0.18), 0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Header Month / Year & Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="font-display text-sm font-bold text-ink">
              {MONTH_NAMES[viewMonth]} <span className="text-primary">{viewYear}</span>
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-ink-variant hover:text-primary transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-ink-variant hover:text-primary transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[11px] font-semibold text-ink-variant/70">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Prev month days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfMonth + 1 + i;
              return (
                <span
                  key={`prev-${i}`}
                  className="h-8 flex items-center justify-center text-xs text-ink-variant/30 rounded-lg"
                >
                  {dayNum}
                </span>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mm = String(viewMonth + 1).padStart(2, "0");
              const dd = String(day).padStart(2, "0");
              const dateStr = `${viewYear}-${mm}-${dd}`;
              const isSelected = value === dateStr;
              const isToday = dateStr === todayStr;

              const dateObj = new Date(dateStr + "T00:00:00");
              const isDisabled = minDateObj ? dateObj < minDateObj : false;

              return (
                <button
                  key={`cur-${day}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={(e) => handleSelectDay(day, e)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-xs font-medium rounded-lg transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-md shadow-primary/30 font-bold scale-105"
                      : isToday
                      ? "border border-primary/40 text-primary font-bold hover:bg-primary/10"
                      : isDisabled
                      ? "text-ink-variant/30 cursor-not-allowed"
                      : "text-ink hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="mt-3 pt-2.5 border-t border-ink/10 flex items-center justify-between text-xs px-1">
            <button
              type="button"
              onClick={handleClear}
              className="text-ink-variant hover:text-danger transition-colors font-medium"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
