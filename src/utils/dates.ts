import type { ProjectTemplate } from '../types/project';

/**
 * Parses YYYY-MM-DD into a local Date object at midnight to prevent UTC shift bugs.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10) - 1;
    const day = Number.parseInt(parts[2], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  const fallback = new Date(dateStr);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Formats a Date object to YYYY-MM-DD (local time)
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats timestamp to "MM/DD/YYYY h:mm A" (e.g. "07/15/2026 8:15 AM")
 */
export function formatTimestamp(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'

  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}

/**
 * Formats a date string for display (e.g. "Jul 15, 2026")
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns the default duration in weeks for a given template.
 */
export function getTemplateDurationWeeks(template: ProjectTemplate): number {
  switch (template) {
    case 'Addition/Renovation':
      return 5;
    case 'Reclad':
      return 8;
    case 'Fire Damage Repair':
      return 5;
    case 'Water Damage Repair':
      return 4;
    case 'Tree Strike':
      return 4;
    case 'Vehicle Impact':
      return 4;
    case 'New Construction':
      return 8;
    case 'Report':
      return 2;
    default:
      return 4;
  }
}

/**
 * Auto-populates due date given a template and start date.
 */
export function calculateDueDateFromTemplate(
  template: ProjectTemplate,
  fromDate: Date = new Date(),
): string {
  const weeks = getTemplateDurationWeeks(template);
  const targetDate = new Date(fromDate.getTime());
  targetDate.setDate(targetDate.getDate() + weeks * 7);
  return formatDateToISO(targetDate);
}

export const TEMPLATE_DEFAULT_TASKS = [
  'Notify Chris for Permitting',
  'APS signed & Marketing Time Moved',
  'Retainer Paid',
  'Site Visit Scheduled',
  'Site Visit Completed',
  'Draft Initial Floor Plans',
  'Drawing Redmarks & Notes',
  'PIC Review',
];

export function getTasksForTemplate(template: ProjectTemplate): string[] {
  if (template === 'No Template' || template === 'Report') {
    return [];
  }
  return [...TEMPLATE_DEFAULT_TASKS];
}

/**
 * Calculates remaining duration percentage:
 * Duration starts at 100% when project created.
 * Duration decreases based on (Current Date), (Project Creation Date), (Project Due Date).
 * Clamps between 0% and 100%.
 */
export function calculateDurationRemaining(
  createdDateStr: string,
  dueDateStr: string,
  now: Date = new Date(),
): {
  percent: number;
  isOverdue: boolean;
  daysRemaining: number;
  totalDays: number;
} {
  const createdDate = parseLocalDate(createdDateStr);
  const dueDate = parseLocalDate(dueDateStr);
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const totalTimeMs = dueDate.getTime() - createdDate.getTime();
  const remainingTimeMs = dueDate.getTime() - nowDate.getTime();

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.round(remainingTimeMs / msPerDay);
  const totalDays = Math.max(1, Math.round(totalTimeMs / msPerDay));

  if (remainingTimeMs < 0) {
    return {
      percent: 0,
      isOverdue: true,
      daysRemaining,
      totalDays,
    };
  }

  if (totalTimeMs <= 0) {
    return {
      percent: 0,
      isOverdue: false,
      daysRemaining,
      totalDays: 1,
    };
  }

  const rawPercent = (remainingTimeMs / totalTimeMs) * 100;
  const percent = Math.min(100, Math.max(0, Math.round(rawPercent)));

  return {
    percent,
    isOverdue: false,
    daysRemaining,
    totalDays,
  };
}

/**
 * Color mapping according to requirements:
 * 1 Green (> 50%)
 * 2 Yellow (25% - 50%)
 * 3 Orange (10% - 24%)
 * 4 Red (< 10% or Overdue)
 */
export function getDurationColor(
  percent: number,
  isOverdue: boolean,
): {
  label: string;
  colorName: 'green' | 'yellow' | 'orange' | 'red';
  hex: string;
  badgeClass: string;
  barColor: string;
} {
  if (isOverdue) {
    return {
      label: 'Overdue',
      colorName: 'red',
      hex: '#ef4444',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
      barColor: '#ef4444',
    };
  }
  if (percent > 50) {
    return {
      label: 'On Schedule',
      colorName: 'green',
      hex: '#22c55e',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      barColor: '#22c55e',
    };
  }
  if (percent >= 25) {
    return {
      label: 'Moderate Time',
      colorName: 'yellow',
      hex: '#eab308',
      badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      barColor: '#eab308',
    };
  }
  if (percent >= 10) {
    return {
      label: 'Approaching Due',
      colorName: 'orange',
      hex: '#f97316',
      badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      barColor: '#f97316',
    };
  }
  return {
    label: 'Critical Due',
    colorName: 'red',
    hex: '#ef4444',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    barColor: '#ef4444',
  };
}

/**
 * Checks if a project is past due (dueDate < today and not completed)
 */
export function isPastDue(dueDateStr: string, completed: boolean, now: Date = new Date()): boolean {
  if (completed) return false;
  const dueDate = parseLocalDate(dueDateStr);
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return dueDate.getTime() < nowDate.getTime();
}

/**
 * Checks if a project is due within 7 days from now (and not past due, not completed)
 */
export function isDueThisWeek(
  dueDateStr: string,
  completed: boolean,
  now: Date = new Date(),
): boolean {
  if (completed) return false;
  const dueDate = parseLocalDate(dueDateStr);
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffDays = Math.round((dueDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}
