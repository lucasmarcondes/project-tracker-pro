import { describe, expect, it } from 'vitest';
import { validateBackupData } from '../db/exportImport';

describe('export & import validation', () => {
  it('accepts a valid backup data object', () => {
    const validData = {
      version: '1.0.0',
      exportedAt: '2026-08-20T12:00:00Z',
      app: 'Project Tracker Pro',
      projects: [
        {
          id: 'proj-1',
          projectNo: '12345',
          projectName: 'Smith Residence',
          template: 'Addition/Renovation',
          createdDate: '2026-08-01',
          dueDate: '2026-09-05',
          completed: false,
          taskList: [{ id: 't-1', text: 'Notify Chris', completed: false }],
          notesLog: [],
        },
      ],
      notepad: '<p>Sample notes</p>',
    };

    const res = validateBackupData(validData);
    expect(res.valid).toBe(true);
    expect(res.data?.projects.length).toBe(1);
    expect(res.data?.projects[0].projectName).toBe('Smith Residence');
  });

  it('rejects null or non-object payloads', () => {
    expect(validateBackupData(null).valid).toBe(false);
    expect(validateBackupData('invalid string').valid).toBe(false);
  });

  it('rejects backups missing the projects array', () => {
    const res = validateBackupData({ version: '4.0.0' });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('projects');
  });

  it('rejects corrupt project elements missing required fields', () => {
    const corruptData = {
      projects: [
        {
          id: 'p-1',
          // missing projectName & projectNo
          dueDate: '2026-08-20',
        },
      ],
    };
    const res = validateBackupData(corruptData);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('projectName');
  });
});
