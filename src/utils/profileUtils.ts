import { User, Organisation, UserWorkSchedule, DateFormatOption, WorkDayName, WorkDaySchedule } from '../types';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
];

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: 'UTC-04:00' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', offset: 'UTC-05:00' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', offset: 'UTC-06:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: 'UTC-07:00' },
  { value: 'America/Anchorage', label: 'Alaska (US)', offset: 'UTC-08:00' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (US)', offset: 'UTC-10:00' },
  { value: 'Europe/London', label: 'London, Dublin, Lisbon (GMT/BST)', offset: 'UTC+01:00' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome, Madrid (CET)', offset: 'UTC+02:00' },
  { value: 'Europe/Helsinki', label: 'Helsinki, Athens, Cairo (EET)', offset: 'UTC+03:00' },
  { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi (GST)', offset: 'UTC+04:00' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST - Mumbai, Delhi)', offset: 'UTC+05:30' },
  { value: 'Asia/Bangkok', label: 'Bangkok, Hanoi, Jakarta (ICT)', offset: 'UTC+07:00' },
  { value: 'Asia/Singapore', label: 'Singapore, Hong Kong, Beijing (SGT/CST)', offset: 'UTC+08:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Seoul (JST/KST)', offset: 'UTC+09:00' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne (AEST)', offset: 'UTC+10:00' },
  { value: 'Pacific/Auckland', label: 'Auckland, Wellington (NZST)', offset: 'UTC+12:00' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: 'UTC+00:00' },
];

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en-US', name: 'English (United States)', nativeName: 'English (US)' },
  { code: 'en-GB', name: 'English (United Kingdom)', nativeName: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
];

export const DATE_FORMAT_OPTIONS: { value: DateFormatOption; label: string; example: string }[] = [
  { value: 'YYYY-MM-DD', label: 'ISO Standard (YYYY-MM-DD)', example: '2026-09-28' },
  { value: 'MM/DD/YYYY', label: 'US Format (MM/DD/YYYY)', example: '09/28/2026' },
  { value: 'DD/MM/YYYY', label: 'UK & International (DD/MM/YYYY)', example: '28/09/2026' },
  { value: 'DD-MMM-YYYY', label: 'Alphanumeric (DD-MMM-YYYY)', example: '28-Sep-2026' },
];

export const DEFAULT_WORK_SCHEDULE: UserWorkSchedule = {
  monday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
  tuesday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
  wednesday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
  thursday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
  friday: { enabled: true, start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '13:30' },
  saturday: { enabled: false, start: '09:00', end: '13:00' },
  sunday: { enabled: false, start: '09:00', end: '17:00' },
};

/**
 * Format currency value according to specified or user's currency
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  maximumFractionDigits: number = 0
): string {
  if (value === undefined || value === null || isNaN(value)) return '$0';

  const cleanCurrency = currency?.toUpperCase() || 'USD';

  try {
    if (cleanCurrency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits,
      }).format(value);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cleanCurrency,
      maximumFractionDigits,
    }).format(value);
  } catch {
    return `${cleanCurrency} ${value.toLocaleString()}`;
  }
}

/**
 * Format 24h time ("HH:mm") into user clock format ("12h" or "24h")
 */
export function formatTimeDisplay(timeStr?: string, clockMode: '12h' | '24h' = '12h'): string {
  if (!timeStr) return '';
  if (clockMode === '24h') {
    return timeStr.substring(0, 5);
  }

  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  if (isNaN(hours)) return timeStr;

  const minutes = minutesStr ? minutesStr.substring(0, 2) : '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Format a date string (YYYY-MM-DD) into user's chosen format
 */
export function formatDateDisplay(
  dateStr?: string,
  formatOption: DateFormatOption = 'YYYY-MM-DD'
): string {
  if (!dateStr) return '';
  const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = dateOnly.split('-');
  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  const monthAbbr = monthNames[monthIdx] || month;

  switch (formatOption) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD-MMM-YYYY':
      return `${day}-${monthAbbr}-${year}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Parse dynamic variables in Welcome Text
 */
export function interpolateWelcomeText(
  template: string,
  user: User,
  organisation: Organisation
): string {
  if (!template) return '';

  const todayStr = formatDateDisplay(
    new Date().toISOString().split('T')[0],
    user.preferences.dateFormat || 'YYYY-MM-DD'
  );

  return template
    .replace(/{userName}/gi, user.name)
    .replace(/{firstName}/gi, user.name.split(' ')[0])
    .replace(/{userRole}/gi, user.role.toUpperCase())
    .replace(/{jobTitle}/gi, user.jobTitle || user.role)
    .replace(/{department}/gi, user.department || 'CRM')
    .replace(/{teamName}/gi, user.team || user.department || 'Sales Team')
    .replace(/{companyName}/gi, organisation.name)
    .replace(/{currentDate}/gi, todayStr);
}

/**
 * Check whether a specific time slot on a date falls within user's working hours
 */
export function isWithinWorkingHours(
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string,
  user: User
): { withinHours: boolean; reason?: string } {
  // Check if availability check is disabled
  if (user.preferences.checkSchedulesAgainstAvailability === false) {
    return { withinHours: true };
  }

  const d = new Date(dateStr + 'T12:00:00Z');
  const dayIndex = d.getUTCDay(); // 0 is Sunday, 1 is Monday, ...
  const dayKeys: WorkDayName[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const dayKey = dayKeys[dayIndex];

  const schedule = user.preferences.workSchedule || DEFAULT_WORK_SCHEDULE;
  const daySchedule: WorkDaySchedule | undefined = schedule[dayKey];

  if (!daySchedule || !daySchedule.enabled) {
    const dayName = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
    return {
      withinHours: false,
      reason: `${user.name} is not scheduled to work on ${dayName}s (Non-working day).`,
    };
  }

  // Check start and end time bounds
  const workStart = daySchedule.start || user.preferences.workingDayStart || '09:00';
  const workEnd = daySchedule.end || user.preferences.workingDayEnd || '17:00';

  if (startTimeStr < workStart || endTimeStr > workEnd) {
    return {
      withinHours: false,
      reason: `Outside normal working hours for ${user.name} (${formatTimeDisplay(workStart, user.preferences.clockMode)} – ${formatTimeDisplay(workEnd, user.preferences.clockMode)}).`,
    };
  }

  // Check break period
  if (daySchedule.breakStart && daySchedule.breakEnd) {
    const hasBreakOverlap = startTimeStr < daySchedule.breakEnd && endTimeStr > daySchedule.breakStart;
    if (hasBreakOverlap) {
      return {
        withinHours: false,
        reason: `Overlaps with scheduled break period (${formatTimeDisplay(daySchedule.breakStart, user.preferences.clockMode)} – ${formatTimeDisplay(daySchedule.breakEnd, user.preferences.clockMode)}).`,
      };
    }
  }

  return { withinHours: true };
}
