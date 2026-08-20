import {
  AppShell,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { version } from '../package.json';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconCircleCheck, IconHelmet, IconPlus } from '@tabler/icons-react';
import type React from 'react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { ControlsBar } from './components/Dashboard/ControlsBar';
import { StatsHeader } from './components/Dashboard/StatsHeader';
import { CalendarModal } from './components/Modals/CalendarModal';
import { CreateProjectModal } from './components/Modals/CreateProjectModal';
import { ImportExportModal } from './components/Modals/ImportExportModal';
import { GlobalNotepad } from './components/Notepad/GlobalNotepad';
import { ProjectCard } from './components/ProjectCard/ProjectCard';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import {
  deleteProject as dbDeleteProject,
  getAllProjects,
  getSetting,
  saveProject,
  saveSetting,
} from './db/idb';
import type { DashboardStats, Project, SortOption, TabMode, ViewMode } from './types/project';
import { playHappyCompletionSound } from './utils/audio';
import { triggerCompletionConfetti } from './utils/confetti';
import { isDueThisWeek, isPastDue } from './utils/dates';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<TabMode>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('dueDate');
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  const [, startTransition] = useTransition();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  const notify = (
    title: string,
    message?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
  ) => {
    notifications.show({
      title,
      message,
      color:
        type === 'error'
          ? 'red'
          : type === 'warning'
            ? 'yellow'
            : type === 'info'
              ? 'blue'
              : 'teal',
      autoClose: 4000,
    });
  };

  const refreshProjects = async () => {
    const list = await getAllProjects();
    setProjects(list);
  };

  useEffect(() => {
    const loadSettings = async () => {
      const savedSort = await getSetting<SortOption>('sort_option', 'dueDate');
      const savedView = await getSetting<ViewMode>('view_mode', 'details');
      const savedTab = await getSetting<TabMode>('active_tab', 'active');
      setSortOption(savedSort);
      setViewMode(savedView);
      setActiveTab(savedTab);
      await refreshProjects();
    };
    loadSettings();
  }, []);

  const handleTabChange = (tab: TabMode) => {
    setActiveTab(tab);
    saveSetting('active_tab', tab);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
    saveSetting('sort_option', sort);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    saveSetting('view_mode', mode);
  };

  const handleCreateProject = async (newProject: Project) => {
    await saveProject(newProject);
    setProjects((prev) => [newProject, ...prev]);
    notify('Project Created', `${newProject.projectName} (#${newProject.projectNo}) added.`);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    startTransition(() => {
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    });
    await saveProject(updatedProject);
  };

  const handleDeleteProject = async (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    await dbDeleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    notify('Project Deleted', `Removed project ${proj?.projectName || ''}.`, 'info');
  };

  const handleCompleteProject = async (project: Project) => {
    const updated: Project = {
      ...project,
      completed: true,
      completedDate: new Date().toISOString(),
    };
    await saveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    // Audio & Confetti
    playHappyCompletionSound();
    triggerCompletionConfetti();

    // Mantine notification
    notify(
      '🎉 Project Completed!',
      `"${project.projectName}" (#${project.projectNo}) moved to Completed Jobs.`,
      'success',
    );
  };

  const handleUncompleteProject = async (project: Project) => {
    const updated: Project = {
      ...project,
      completed: false,
      completedDate: undefined,
    };
    await saveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    notify('Project Re-opened', `"${project.projectName}" moved back to Active Jobs.`, 'info');
  };

  const stats: DashboardStats = useMemo(() => {
    let activeProjects = 0;
    let completedProjects = 0;
    let pastDue = 0;
    let dueThisWeek = 0;

    for (const p of projects) {
      if (p.completed) {
        completedProjects++;
      } else {
        activeProjects++;
        if (isPastDue(p.dueDate, p.completed)) {
          pastDue++;
        } else if (isDueThisWeek(p.dueDate, p.completed)) {
          dueThisWeek++;
        }
      }
    }

    return {
      activeProjects,
      completedProjects,
      pastDue,
      dueThisWeek,
      totalProjects: projects.length,
    };
  }, [projects]);

  const filteredAndSortedProjects = useMemo(() => {
    let list = projects.filter((p) => (activeTab === 'active' ? !p.completed : p.completed));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.projectName.toLowerCase().includes(q) ||
          p.projectNo.toLowerCase().includes(q) ||
          p.template.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      if (sortOption === 'alphabetical') {
        return a.projectName.localeCompare(b.projectName, undefined, { sensitivity: 'base' });
      }
      if (sortOption === 'projectNo') {
        return a.projectNo.localeCompare(b.projectNo, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }
      if (sortOption === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortOption === 'timeRemaining') {
        const now = Date.now();
        const dueA = new Date(a.dueDate).getTime() - now;
        const dueB = new Date(b.dueDate).getTime() - now;
        return dueA - dueB;
      }
      return 0;
    });
  }, [projects, activeTab, searchQuery, sortOption]);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      {/* Top Header */}
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group justify="space-between" align="center" h="100%">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" variant="default">
                <IconHelmet size={20} />
              </ThemeIcon>
              <div>
                <Group gap={6} align="center">
                  <Text fw={800} fz="sm" style={{ letterSpacing: '0.2px' }}>
                    Project Tracker Pro
                  </Text>
                  <Badge variant="outline" color="gray" size="xs" fw={700}>
                    {version}
                  </Badge>
                </Group>
                <Text size="11px" c="dimmed">
                  Residential Construction & Restoration
                </Text>
              </div>
            </Group>

            <Group gap="xs">
              <Badge color="teal" variant="dot" size="sm" visibleFrom="sm">
                IndexedDB Active
              </Badge>
              {/* Light / Dark Mode Toggle */}
              <ThemeToggle />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* Main Container */}
      <AppShell.Main>
        <Container size="xl" py="md">
          <Stack gap="lg">
            {/* Dashboard Stats */}
            <StatsHeader stats={stats} activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Filter, Search & View Controls */}
            <ControlsBar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOption={sortOption}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
              onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
              isNotepadOpen={isNotepadOpen}
              onToggleNotepad={() => setIsNotepadOpen((prev) => !prev)}
            />

            {/* Feed */}
            {filteredAndSortedProjects.length === 0 ? (
              <Paper
                p="xl"
                radius="md"
                withBorder
                style={{ borderStyle: 'dashed', textAlign: 'center' }}
              >
                <Stack align="center" gap="sm">
                  <ThemeIcon size={48} radius="md" variant="light" color="gray">
                    {activeTab === 'active' ? (
                      <IconBuilding size={24} />
                    ) : (
                      <IconCircleCheck size={24} color="var(--mantine-color-teal-5)" />
                    )}
                  </ThemeIcon>
                  <Text fw={700} size="sm">
                    {searchQuery
                      ? 'No matching projects found'
                      : activeTab === 'active'
                        ? 'No Active Projects'
                        : 'No Completed Projects Yet'}
                  </Text>
                  <Text size="xs" c="dimmed" maw={380}>
                    {searchQuery
                      ? `No projects matched "${searchQuery}". Try a different search term.`
                      : activeTab === 'active'
                        ? 'Get started by creating your first residential construction job.'
                        : 'When you finish active projects and mark them complete, they will appear here.'}
                  </Text>
                  {activeTab === 'active' && !searchQuery && (
                    <Button
                      variant="filled"
                      size="xs"
                      leftSection={<IconPlus size={14} stroke={2.5} />}
                      onClick={() => setIsCreateModalOpen(true)}
                      radius="md"
                      fw={700}
                      mt="xs"
                    >
                      Create First Project
                    </Button>
                  )}
                </Stack>
              </Paper>
            ) : (
              <SimpleGrid cols={viewMode === 'compact' ? { base: 1, md: 2 } : 1} spacing="md">
                {filteredAndSortedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    viewMode={viewMode}
                    onUpdateProject={handleUpdateProject}
                    onCompleteProject={handleCompleteProject}
                    onUncompleteProject={handleUncompleteProject}
                    onDeleteProject={handleDeleteProject}
                  />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Container>
      </AppShell.Main>

      {/* Global Notepad Drawer */}
      <GlobalNotepad isOpen={isNotepadOpen} onClose={() => setIsNotepadOpen(false)} />

      {/* Create Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        projects={projects}
      />

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onDataChanged={refreshProjects}
        onToast={notify}
      />
    </AppShell>
  );
};
