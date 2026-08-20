import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Paper,
  Popover,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import type React from 'react';
import { useState } from 'react';
import type { TaskItem } from '../../types/project';
import { formatDateToISO, formatDisplayDate, parseLocalDate } from '../../utils/dates';

interface TasksSectionProps {
  taskList: TaskItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddTask: (text: string) => void;
  onEditTask: (taskId: string, newText: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onSetTaskDueDate: (taskId: string, dateStr: string | undefined) => void;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  taskList,
  isCollapsed,
  onToggleCollapse,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskComplete,
  onSetTaskDueDate,
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleStartAdd = () => {
    setIsAdding(true);
  };

  const handleSaveNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editingText.trim()) {
      onEditTask(taskId, editingText.trim());
    }
    setEditingTaskId(null);
  };

  const completedCount = taskList.filter((t) => t.completed).length;

  return (
    <Paper radius="md" withBorder>
      {/* Collapsible Header */}
      <Box p="xs" bg="var(--mantine-color-default-hover)">
        <Group justify="space-between" align="center">
          <UnstyledButton onClick={onToggleCollapse} flex={1}>
            <Group gap="xs">
              {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
              <Text size="xs" fw={700} tt="uppercase">
                Tasks
              </Text>
              <Badge size="xs" variant="light" color="gray">
                {completedCount}/{taskList.length}
              </Badge>
            </Group>
          </UnstyledButton>

          {!isCollapsed && (
            <Button
              size="xs"
              variant="light"
              color="gray"
              leftSection={<IconPlus size={12} />}
              onClick={handleStartAdd}
              radius="sm"
            >
              Add Task
            </Button>
          )}
        </Group>
      </Box>

      {/* Expanded Content */}
      <Box display={isCollapsed ? 'none' : 'block'}>
        <Stack p="sm" gap="xs">
          {/* Add Task Form */}
          {isAdding && (
            <form onSubmit={handleSaveNewTask}>
              <Group gap="xs">
                <TextInput
                  autoFocus
                  placeholder="Enter task name..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.currentTarget.value)}
                  size="xs"
                  flex={1}
                />
                <Button size="xs" variant="filled" type="submit">
                  Save
                </Button>
                <Button
                  size="xs"
                  variant="default"
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTaskText('');
                  }}
                >
                  Cancel
                </Button>
              </Group>
            </form>
          )}

          {taskList.length === 0 && !isAdding && (
            <Text size="xs" c="dimmed" fs="italic" ta="center" py="xs">
              No tasks yet. Click &quot;Add Task&quot; above to create one.
            </Text>
          )}

          {taskList.map((task) => {
            const isEditing = editingTaskId === task.id;

            return (
              <Paper key={task.id} p="xs" radius="sm" withBorder>
                <Group justify="space-between" align="center" wrap="nowrap">
                  {/* Left: Checkbox & Text */}
                  <Group gap="sm" wrap="nowrap" flex={1} style={{ minWidth: 0 }}>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => onToggleTaskComplete(task.id)}
                      size="xs"
                      color="teal"
                      aria-label="Toggle Complete"
                    />

                    {isEditing ? (
                      <Group gap="xs" flex={1}>
                        <TextInput
                          size="xs"
                          value={editingText}
                          onChange={(e) => setEditingText(e.currentTarget.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(task.id);
                            if (e.key === 'Escape') setEditingTaskId(null);
                          }}
                          autoFocus
                          flex={1}
                        />
                        <ActionIcon
                          size="sm"
                          color="teal"
                          variant="light"
                          onClick={() => handleSaveEdit(task.id)}
                        >
                          <IconCheck size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="default"
                          onClick={() => setEditingTaskId(null)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </Group>
                    ) : (
                      <Group gap="xs" wrap="wrap" flex={1} style={{ minWidth: 0 }}>
                        <Text
                          size="xs"
                          fw={600}
                          td={task.completed ? 'line-through' : undefined}
                          c={task.completed ? 'dimmed' : undefined}
                        >
                          {task.text}
                        </Text>

                        {task.dueDate && (
                          <Badge
                            size="xs"
                            variant="outline"
                            color="gray"
                            leftSection={<IconCalendar size={10} />}
                          >
                            {formatDisplayDate(task.dueDate)}
                          </Badge>
                        )}
                      </Group>
                    )}
                  </Group>

                  {/* Right Actions: Calendar 📅, Edit ✏, Delete 🗑 */}
                  <Group gap={4} wrap="nowrap">
                    {/* Calendar Popover */}
                    <Popover position="bottom-end" withArrow shadow="md">
                      <Popover.Target>
                        <ActionIcon
                          variant={task.dueDate ? 'light' : 'subtle'}
                          color={task.dueDate ? 'blue' : 'gray'}
                          size="sm"
                          title="Schedule on Calendar 📅"
                        >
                          <IconCalendar size={14} />
                        </ActionIcon>
                      </Popover.Target>
                      <Popover.Dropdown p="xs">
                        <Stack gap="xs">
                          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Attach to Calendar:
                          </Text>
                          <DateInput
                            size="xs"
                            placeholder="Pick date"
                            valueFormat="YYYY-MM-DD"
                            value={task.dueDate ? parseLocalDate(task.dueDate) : null}
                            onChange={(val) => {
                              onSetTaskDueDate(task.id, val ? formatDateToISO(val) : undefined);
                            }}
                            clearable
                            w={150}
                          />
                        </Stack>
                      </Popover.Dropdown>
                    </Popover>

                    {/* Edit Pencil ✏ */}
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={() => handleStartEdit(task)}
                      title="Edit task"
                    >
                      <IconPencil size={14} />
                    </ActionIcon>

                    {/* Delete Icon 🗑 */}
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};
