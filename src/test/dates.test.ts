import { describe, expect, it } from 'vitest';
import {
  calculateDueDateFromTemplate,
  calculateDurationRemaining,
  formatDateToISO,
  getDurationColor,
  getTasksForTemplate,
  getTemplateDurationWeeks,
  isDueThisWeek,
  isPastDue,
  parseLocalDate,
} from '../utils/dates';

describe('dates utility & calculations', () => {
  it('correctly parses local date without timezone offset shift', () => {
    const d = parseLocalDate('2026-08-20');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7); // 0-indexed August
    expect(d.getDate()).toBe(20);
  });

  it('formats Date back to YYYY-MM-DD', () => {
    const d = new Date(2026, 7, 20);
    expect(formatDateToISO(d)).toBe('2026-08-20');
  });

  it('returns correct template duration weeks', () => {
    expect(getTemplateDurationWeeks('Addition/Renovation')).toBe(5);
    expect(getTemplateDurationWeeks('Reclad')).toBe(8);
    expect(getTemplateDurationWeeks('Fire Damage Repair')).toBe(5);
    expect(getTemplateDurationWeeks('Water Damage Repair')).toBe(4);
    expect(getTemplateDurationWeeks('Tree Strike')).toBe(4);
    expect(getTemplateDurationWeeks('Vehicle Impact')).toBe(4);
    expect(getTemplateDurationWeeks('New Construction')).toBe(8);
    expect(getTemplateDurationWeeks('Report')).toBe(2);
  });

  it('calculates due date from template duration accurately', () => {
    const baseDate = new Date(2026, 0, 1); // 2026-01-01
    const dueDate = calculateDueDateFromTemplate('Addition/Renovation', baseDate);
    // 5 weeks = 35 days -> 2026-02-05
    expect(dueDate).toBe('2026-02-05');
  });

  it('generates 8 default tasks for standard templates and 0 for No Template and Report', () => {
    const fireTasks = getTasksForTemplate('Fire Damage Repair');
    expect(fireTasks.length).toBe(8);
    expect(fireTasks[0]).toBe('Notify Chris for Permitting');
    expect(fireTasks[7]).toBe('PIC Review');

    expect(getTasksForTemplate('No Template')).toEqual([]);
    expect(getTasksForTemplate('Report')).toEqual([]);
  });

  it('calculates duration remaining % and handles overdue properly', () => {
    const created = '2026-08-01';
    const due = '2026-08-21'; // 20 days total

    // At day 10 (halfway)
    const midDate = new Date(2026, 7, 11);
    const midResult = calculateDurationRemaining(created, due, midDate);
    expect(midResult.percent).toBe(50);
    expect(midResult.isOverdue).toBe(false);

    // Overdue case
    const overdueDate = new Date(2026, 7, 25);
    const overdueResult = calculateDurationRemaining(created, due, overdueDate);
    expect(overdueResult.percent).toBe(0);
    expect(overdueResult.isOverdue).toBe(true);
  });

  it('maps duration colors according to requirements', () => {
    expect(getDurationColor(80, false).colorName).toBe('green');
    expect(getDurationColor(40, false).colorName).toBe('yellow');
    expect(getDurationColor(20, false).colorName).toBe('orange');
    expect(getDurationColor(5, false).colorName).toBe('red');
    expect(getDurationColor(0, true).colorName).toBe('red');
  });

  it('correctly checks isPastDue and isDueThisWeek', () => {
    const now = new Date(2026, 7, 20);

    // Past due
    expect(isPastDue('2026-08-15', false, now)).toBe(true);
    // Completed project is never past due
    expect(isPastDue('2026-08-15', true, now)).toBe(false);

    // Due in 3 days -> Due this week
    expect(isDueThisWeek('2026-08-23', false, now)).toBe(true);
    // Due in 20 days -> NOT due this week
    expect(isDueThisWeek('2026-09-09', false, now)).toBe(false);
  });
});
