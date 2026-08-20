import type { Project } from '../types/project';
import {
  bulkSaveProjects,
  clearAllProjects,
  getAllProjects,
  getNotepadContent,
  saveNotepadContent,
} from './idb';

export interface BackupData {
  version: string;
  exportedAt: string;
  app: 'Project Tracker Pro';
  projects: Project[];
  notepad: string;
}

/**
 * Validates whether an imported object matches the Project Tracker Pro schema.
 */
export function validateBackupData(data: unknown): {
  valid: boolean;
  error?: string;
  data?: BackupData;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File does not contain valid JSON data.' };
  }

  const obj = data as Record<string, any>;

  if (!Array.isArray(obj.projects)) {
    return { valid: false, error: 'Backup file must contain a "projects" array.' };
  }

  // Validate project elements
  for (let i = 0; i < obj.projects.length; i++) {
    const p = obj.projects[i];
    if (!p || typeof p !== 'object') {
      return { valid: false, error: `Invalid project entry at index ${i}.` };
    }
    if (!p.id || typeof p.id !== 'string') {
      return { valid: false, error: `Project at index ${i} is missing a valid id.` };
    }
    if (!p.projectName || typeof p.projectName !== 'string') {
      return { valid: false, error: `Project at index ${i} is missing a projectName.` };
    }
    if (!p.projectNo || typeof p.projectNo !== 'string') {
      return { valid: false, error: `Project at index ${i} is missing a projectNo.` };
    }
    if (!p.dueDate || typeof p.dueDate !== 'string') {
      return { valid: false, error: `Project at index ${i} is missing a dueDate.` };
    }
    if (!Array.isArray(p.taskList)) {
      p.taskList = [];
    }
    if (!Array.isArray(p.notesLog)) {
      p.notesLog = [];
    }
  }

  return {
    valid: true,
    data: {
      version: typeof obj.version === 'string' ? obj.version : '4.0.0',
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
      app: 'Project Tracker Pro',
      projects: obj.projects as Project[],
      notepad: typeof obj.notepad === 'string' ? obj.notepad : '',
    },
  };
}

/**
 * Generates and downloads a JSON backup file.
 */
export async function exportDatabaseBackup(): Promise<void> {
  const projects = await getAllProjects();
  const notepad = await getNotepadContent();

  const backup: BackupData = {
    version: '4.0.0',
    exportedAt: new Date().toISOString(),
    app: 'Project Tracker Pro',
    projects,
    notepad,
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateTag = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `project_tracker_backup_${dateTag}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports backup data into IndexedDB with Replace All or Merge modes.
 */
export async function importDatabaseBackup(
  backup: BackupData,
  mode: 'replace' | 'merge' = 'replace',
): Promise<{ success: boolean; projectCount: number }> {
  if (mode === 'replace') {
    await clearAllProjects();
    await bulkSaveProjects(backup.projects);
    if (backup.notepad) {
      await saveNotepadContent(backup.notepad);
    }
  } else {
    // Merge mode: retain existing, overwrite matching IDs, append new
    const existing = await getAllProjects();
    const existingMap = new Map(existing.map((p) => [p.id, p]));

    for (const p of backup.projects) {
      existingMap.set(p.id, p);
    }

    await bulkSaveProjects(Array.from(existingMap.values()));
    if (backup.notepad) {
      const currentNotepad = await getNotepadContent();
      await saveNotepadContent(`${currentNotepad}\n<hr />\n${backup.notepad}`);
    }
  }

  return {
    success: true,
    projectCount: backup.projects.length,
  };
}
