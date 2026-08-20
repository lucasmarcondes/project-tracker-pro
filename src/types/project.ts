export type ProjectTemplate =
  | 'No Template'
  | 'Addition/Renovation'
  | 'Reclad'
  | 'Fire Damage Repair'
  | 'Water Damage Repair'
  | 'Tree Strike'
  | 'Vehicle Impact'
  | 'New Construction'
  | 'Report';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
}

export interface NoteItem {
  id: string;
  timestamp: string; // e.g. "08/20/2026 8:15 AM"
  text: string;
}

export interface Project {
  id: string;
  projectNo: string;
  projectName: string;
  template: ProjectTemplate;
  createdDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedDate?: string; // ISO or formatted
  notesLog: NoteItem[];
  taskList: TaskItem[];
  collapsedSections?: {
    tasks?: boolean;
    notes?: boolean;
  };
}

export interface NotepadState {
  content: string;
  lastUpdated: string;
}

export type SortOption = 'alphabetical' | 'projectNo' | 'dueDate' | 'timeRemaining';

export type ViewMode = 'details' | 'compact';

export type TabMode = 'active' | 'completed';

export interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  pastDue: number;
  dueThisWeek: number;
  totalProjects: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
