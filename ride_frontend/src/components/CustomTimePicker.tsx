import React, { useState, useRef, useEffect } from "react";
import { Clock as ClockIcon, X, Check } from "lucide-react";

interface CustomTimePickerProps {
  value: string; // HH:mm (24-hour format)
  onChange: (timeStr: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export default function CustomTimePicker({
  value,
  onChange,
  placeholder = "Select Time",
  className = "",
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse existing HH:mm into 12-hour components
  const parseTime = (val: string) => {
    if (!val || !val.includes(":")) {
      const now = new Date();
      const h24 = now.getHours();
      const m = Math.ceil(now.getMinutes() / 5) * 5 % 60;
      return {
        hour12: h24 % 12 === 0 ? 12 : h24 % 12,
        minute: String(m).padStart(2, "0"),
        period: h24 >= 12 ? "PM" : "AM",
      };
    }
    const [hStr, mStr] = val.split(":");
    const h24 = parseInt(hStr, 10) || 0;
    const m = mStr || "00";
    return {
      hour12: h24 % 12 === 0 ? 12 : h24 % 12,
      minute: m.padStart(2, "0"),
      period: h24 >= 12 ? "PM" : "AM",
    };
  };

  const initial = parseTime(value);
  const [selectedHour, setSelectedHour] = useState<number>(initial.hour12);
  const [selectedMinute, setSelectedMinute] = useState<string>(initial.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(initial.period as "AM" | "PM");

  // Keep local state in sync when value prop updates
  useEffect(() => {
    if (value) {
      const parsed = parseTime(value);
      setSelectedHour(parsed.hour12);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period as "AM" | "PM");
    }
  }, [value]);

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

  const commitTime = (h12: number, min: string, per: "AM" | "PM") => {
    let h24 = h12;
    if (per === "AM") {
      h24 = h12 === 12 ? 0 : h12;
    } else {
      h24 = h12 === 12 ? 12 : h12 + 12;
    }
    const time24 = `${String(h24).padStart(2, "0")}:${min}`;
    onChange(time24);
  };

  const handleHourSelect = (h: number) => {
    setSelectedHour(h);
    commitTime(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (m: string) => {
    setSelectedMinute(m);
    commitTime(selectedHour, m, selectedPeriod);
  };

  const handlePeriodToggle = (p: "AM" | "PM") => {
    setSelectedPeriod(p);
    commitTime(selectedHour, selectedMinute, p);
  };

  const formatDisplay = (val: string) => {
    if (!val) return "";
    const parsed = parseTime(val);
    return `${parsed.hour12}:${parsed.minute} ${parsed.period}`;
  };

  const handleQuickPick = (h24: number, m: number) => {
    const time24 = `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onChange(time24);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Input Trigger */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass-input flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all hover:border-primary/50"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <ClockIcon className="w-5 h-5 text-primary shrink-0" />
          <span className={`text-sm truncate ${value ? "text-ink font-medium" : "text-ink-variant/50"}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-ink-variant/50 hover:text-ink hover:bg-ink/5 transition-colors"
            title="Clear time"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 right-0 sm:right-auto left-0 sm:left-auto w-72 rounded-2xl glass-strong border border-white/80 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            boxShadow: "0 20px 48px rgba(46, 123, 255, 0.18), 0 4px 16px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Header & AM/PM Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display text-sm font-bold text-ink">
              Select <span className="text-primary">Time</span>
            </h4>
            <div className="flex p-0.5 rounded-lg bg-ink/5 border border-ink/10">
              <button
                type="button"
                onClick={() => handlePeriodToggle("AM")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedPeriod === "AM"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-variant hover:text-ink"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handlePeriodToggle("PM")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedPeriod === "PM"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-variant hover:text-ink"
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Hour & Minute Selectors Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Hours Column */}
            <div>
              <p className="text-[11px] font-semibold text-ink-variant uppercase tracking-wider mb-2 text-center">
                Hour
              </p>
              <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto p-1 bg-white/40 rounded-xl border border-white/60">
                {HOURS_12.map((h) => (
                  <button
                    key={`h-${h}`}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={`h-7 text-xs font-medium rounded-lg transition-all ${
                      selectedHour === h
                        ? "bg-primary text-white font-bold shadow-sm"
                        : "text-ink hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <p className="text-[11px] font-semibold text-ink-variant uppercase tracking-wider mb-2 text-center">
                Minute
              </p>
              <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto p-1 bg-white/40 rounded-xl border border-white/60">
                {MINUTES.map((m) => (
                  <button
                    key={`m-${m}`}
                    type="button"
                    onClick={() => handleMinuteSelect(m)}
                    className={`h-7 text-xs font-medium rounded-lg transition-all ${
                      selectedMinute === m
                        ? "bg-primary text-white font-bold shadow-sm"
                        : "text-ink hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="border-t border-ink/10 pt-3 flex flex-wrap gap-1.5 justify-between">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                handleQuickPick(now.getHours(), Math.ceil(now.getMinutes() / 5) * 5 % 60);
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => {
                const inOne = new Date(Date.now() + 60 * 60 * 1000);
                handleQuickPick(inOne.getHours(), Math.ceil(inOne.getMinutes() / 5) * 5 % 60);
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-secondary/15 text-secondary-dark hover:bg-secondary/25 transition-colors"
            >
              +1 Hour
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary-dark transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
