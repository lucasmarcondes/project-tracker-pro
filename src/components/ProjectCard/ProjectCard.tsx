import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DateInput, type DateValue } from '@mantine/dates';
import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconCircleCheck,
  IconLayersLinked,
  IconPencil,
  IconRotateClockwise2,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import type React from 'react';
import { useState } from 'react';
import type { NoteItem, Project, TaskItem, ViewMode } from '../../types/project';
import { formatDateToISO, formatDisplayDate, parseLocalDate } from '../../utils/dates';
import { ConfirmModal } from '../Modals/ConfirmModal';
import { DurationBar } from './DurationBar';
import { NotesSection } from './NotesSection';
import { ProgressBar } from './ProgressBar';
import { TasksSection } from './TasksSection';

interface ProjectCardProps {
  project: Project;
  viewMode: ViewMode;
  onUpdateProject: (updated: Project) => void;
  onCompleteProject: (project: Project) => void;
  onUncompleteProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onUpdateProject,
  onCompleteProject,
  onUncompleteProject,
  onDeleteProject,
}) => {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Inline editing state for Project Name and Due Date
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(project.projectName);

  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState<DateValue>(() =>
    parseLocalDate(project.dueDate),
  );

  const toggleTasksCollapse = () => {
    const current = project.collapsedSections?.tasks ?? false;
    onUpdateProject({
      ...project,
      collapsedSections: {
        ...project.collapsedSections,
        tasks: !current,
      },
    });
  };

  const toggleNotesCollapse = () => {
    const current = project.collapsedSections?.notes ?? false;
    onUpdateProject({
      ...project,
      collapsedSections: {
        ...project.collapsedSections,
        notes: !current,
      },
    });
  };

  const handleAddTask = (text: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      completed: false,
    };
    onUpdateProject({
      ...project,
      taskList: [...project.taskList, newTask],
    });
  };

  const handleEditTask = (taskId: string, newText: string) => {
    onUpdateProject({
      ...project,
      taskList: project.taskList.map((t) => (t.id === taskId ? { ...t, text: newText } : t)),
    });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateProject({
      ...project,
      taskList: project.taskList.filter((t) => t.id !== taskId),
    });
  };

  const handleToggleTaskComplete = (taskId: string) => {
    onUpdateProject({
      ...project,
      taskList: project.taskList.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    });
  };

  const handleSetTaskDueDate = (taskId: string, dateStr: string | undefined) => {
    onUpdateProject({
      ...project,
      taskList: project.taskList.map((t) => (t.id === taskId ? { ...t, dueDate: dateStr } : t)),
    });
  };

  const handleAddNote = (text: string, timestamp: string) => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      text,
    };
    onUpdateProject({
      ...project,
      notesLog: [newNote, ...project.notesLog],
    });
  };

  const handleEditNote = (noteId: string, newText: string) => {
    onUpdateProject({
      ...project,
      notesLog: project.notesLog.map((n) => (n.id === noteId ? { ...n, text: newText } : n)),
    });
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateProject({
      ...project,
      notesLog: project.notesLog.filter((n) => n.id !== noteId),
    });
  };

  const handleSaveName = () => {
    if (editingName.trim()) {
      onUpdateProject({ ...project, projectName: editingName.trim() });
    }
    setIsEditingName(false);
  };

  const handleSaveDueDate = () => {
    if (editingDueDate) {
      onUpdateProject({ ...project, dueDate: formatDateToISO(editingDueDate) });
    }
    setIsEditingDueDate(false);
  };

  const isCompact = viewMode === 'compact';

  return (
    <>
      <Card padding="md" radius="md" withBorder opacity={project.completed ? 0.85 : 1}>
        <Stack gap="sm">
          {/* Card Header */}
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
            {/* Top Left: Project Name (Large & Bold) & Info */}
            <Stack gap={4} flex={1} style={{ minWidth: 200 }}>
              {isEditingName ? (
                <Group gap="xs" wrap="nowrap">
                  <TextInput
                    value={editingName}
                    onChange={(e) => setEditingName(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    autoFocus
                    size="sm"
                    maw={{ base: '100%', sm: 350 }}
                    flex={1}
                  />
                  <ActionIcon color="teal" size="sm" onClick={handleSaveName}>
                    <IconCheck size={14} />
                  </ActionIcon>
                  <ActionIcon variant="default" size="sm" onClick={() => setIsEditingName(false)}>
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              ) : (
                <Group gap="xs" wrap="wrap">
                  <Group gap={6}>
                    <IconBuilding size={18} />
                    <Text fw={800} fz={{ base: 'sm', sm: 'md' }}>
                      {project.projectName}
                    </Text>
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={() => {
                      setEditingName(project.projectName);
                      setIsEditingName(true);
                    }}
                    title="Edit project name"
                  >
                    <IconPencil size={13} />
                  </ActionIcon>
                </Group>
              )}

              {/* Badges: Project Number, Template, Due Date (All Bold) */}
              <Group gap="xs" wrap="wrap" mt={2}>
                <Badge color="gray" variant="light" size="sm" radius="sm" fw={800} ff="monospace">
                  #{project.projectNo}
                </Badge>

                <Badge
                  color="gray"
                  variant="outline"
                  size="sm"
                  radius="sm"
                  fw={700}
                  leftSection={<IconLayersLinked size={12} />}
                >
                  {project.template}
                </Badge>

                {/* Due Date with Inline Edit ✏ */}
                {isEditingDueDate ? (
                  <Group gap={4}>
                    <DateInput
                      size="xs"
                      valueFormat="YYYY-MM-DD"
                      value={editingDueDate}
                      onChange={setEditingDueDate}
                      w={130}
                      autoFocus
                    />
                    <ActionIcon size="xs" color="teal" onClick={handleSaveDueDate}>
                      <IconCheck size={12} />
                    </ActionIcon>
                    <ActionIcon
                      size="xs"
                      variant="default"
                      onClick={() => setIsEditingDueDate(false)}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Badge
                    color="gray"
                    variant="outline"
                    size="sm"
                    radius="sm"
                    fw={700}
                    leftSection={<IconCalendar size={12} />}
                    rightSection={
                      <ActionIcon
                        variant="transparent"
                        size="xs"
                        c="dimmed"
                        onClick={() => {
                          setEditingDueDate(parseLocalDate(project.dueDate));
                          setIsEditingDueDate(true);
                        }}
                        title="Edit due date"
                      >
                        <IconPencil size={10} />
                      </ActionIcon>
                    }
                  >
                    Due: {formatDisplayDate(project.dueDate)}
                  </Badge>
                )}
              </Group>
            </Stack>

            {/* Top Right Controls: Complete & 🗑 */}
            <Group gap="xs" wrap="nowrap" align="center">
              {project.completed ? (
                <Button
                  variant="default"
                  size="xs"
                  radius="md"
                  leftSection={<IconRotateClockwise2 size={14} />}
                  onClick={() => onUncompleteProject(project)}
                >
                  Re-open
                </Button>
              ) : (
                <Button
                  variant="light"
                  color="teal"
                  size="xs"
                  radius="md"
                  leftSection={<IconCircleCheck size={15} />}
                  onClick={() => setShowCompleteConfirm(true)}
                  fw={700}
                >
                  Complete
                </Button>
              )}

              {/* Garbage can only. No text. */}
              <ActionIcon
                variant="default"
                size="32px"
                radius="md"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete project"
                aria-label="Delete project"
              >
                <IconTrash size={15} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Duration & Progress Bars */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <DurationBar createdDate={project.createdDate} dueDate={project.dueDate} />
            <ProgressBar taskList={project.taskList} />
          </SimpleGrid>

          {/* Details / Compact sections */}
          {!isCompact ? (
            <Stack gap="xs" mt="xs">
              <Divider />
              <TasksSection
                taskList={project.taskList}
                isCollapsed={project.collapsedSections?.tasks ?? false}
                onToggleCollapse={toggleTasksCollapse}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleTaskComplete={handleToggleTaskComplete}
                onSetTaskDueDate={handleSetTaskDueDate}
              />

              <NotesSection
                notesLog={project.notesLog}
                isCollapsed={project.collapsedSections?.notes ?? false}
                onToggleCollapse={toggleNotesCollapse}
                onAddNote={handleAddNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
              />
            </Stack>
          ) : (
            <Stack gap="xs" mt="xs">
              <Divider />
              <TasksSection
                taskList={project.taskList}
                isCollapsed={project.collapsedSections?.tasks ?? true}
                onToggleCollapse={toggleTasksCollapse}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleTaskComplete={handleToggleTaskComplete}
                onSetTaskDueDate={handleSetTaskDueDate}
              />
              <NotesSection
                notesLog={project.notesLog}
                isCollapsed={project.collapsedSections?.notes ?? true}
                onToggleCollapse={toggleNotesCollapse}
                onAddNote={handleAddNote}
                onEditNote={handleEditNote}
                onDeleteNote={handleDeleteNote}
              />
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Confirmation Modal for Complete */}
      <ConfirmModal
        isOpen={showCompleteConfirm}
        title="Mark Project Complete?"
        message={`Are you sure you want to mark "${project.projectName}" (#${project.projectNo}) as complete? This will move it to the Completed Jobs tab.`}
        confirmText="Yes, Complete"
        cancelText="No"
        variant="success"
        onConfirm={() => {
          setShowCompleteConfirm(false);
          onCompleteProject(project);
        }}
        onCancel={() => setShowCompleteConfirm(false)}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Project?"
        message="Are you sure you want to delete this project? All associated tasks, schedules, and notes will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteProject(project.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
