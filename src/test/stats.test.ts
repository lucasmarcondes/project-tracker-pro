import { describe, expect, it } from 'vitest';
import type { Project } from '../types/project';
import { isDueThisWeek, isPastDue } from '../utils/dates';

describe('dashboard stats calculation', () => {
  it('correctly categorizes active, completed, past due, and due this week', () => {
    const now = new Date(2026, 7, 20); // 2026-08-20

    const projects: Project[] = [
      {
        id: '1',
        projectNo: '100',
        projectName: 'Active On Track',
        template: 'Addition/Renovation',
        createdDate: '2026-08-01',
        dueDate: '2026-09-15', // future
        completed: false,
        taskList: [],
        notesLog: [],
      },
      {
        id: '2',
        projectNo: '101',
        projectName: 'Active Due In 3 Days',
        template: 'Fire Damage Repair',
        createdDate: '2026-08-01',
        dueDate: '2026-08-23', // due in 3 days
        completed: false,
        taskList: [],
        notesLog: [],
      },
      {
        id: '3',
        projectNo: '102',
        projectName: 'Active Past Due',
        template: 'Water Damage Repair',
        createdDate: '2026-07-01',
        dueDate: '2026-08-10', // past due
        completed: false,
        taskList: [],
        notesLog: [],
      },
      {
        id: '4',
        projectNo: '103',
        projectName: 'Completed Job',
        template: 'New Construction',
        createdDate: '2026-06-01',
        dueDate: '2026-08-01',
        completed: true,
        taskList: [],
        notesLog: [],
      },
    ];

    let activeProjects = 0;
    let completedProjects = 0;
    let pastDue = 0;
    let dueThisWeek = 0;

    for (const p of projects) {
      if (p.completed) {
        completedProjects++;
      } else {
        activeProjects++;
        if (isPastDue(p.dueDate, p.completed, now)) {
          pastDue++;
        } else if (isDueThisWeek(p.dueDate, p.completed, now)) {
          dueThisWeek++;
        }
      }
    }

    expect(activeProjects).toBe(3);
    expect(completedProjects).toBe(1);
    expect(pastDue).toBe(1);
    expect(dueThisWeek).toBe(1);
    expect(projects.length).toBe(4);
  });
});
