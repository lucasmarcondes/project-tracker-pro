import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconFlag,
  IconSquareCheck,
} from '@tabler/icons-react';
import type React from 'react';
import { useState } from 'react';
import type { Project } from '../../types/project';
import { formatDateToISO } from '../../utils/dates';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, projects }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map events by date YYYY-MM-DD
  const eventsByDate = new Map<
    string,
    {
      type: 'project_due' | 'task_scheduled';
      projectName: string;
      projectNo: string;
      taskText?: string;
      completed?: boolean;
    }[]
  >();

  for (const proj of projects) {
    if (proj.dueDate) {
      const existing = eventsByDate.get(proj.dueDate) || [];
      existing.push({
        type: 'project_due',
        projectName: proj.projectName,
        projectNo: proj.projectNo,
        completed: proj.completed,
      });
      eventsByDate.set(proj.dueDate, existing);
    }

    for (const task of proj.taskList || []) {
      if (task.dueDate) {
        const existing = eventsByDate.get(task.dueDate) || [];
        existing.push({
          type: 'task_scheduled',
          projectName: proj.projectName,
          projectNo: proj.projectNo,
          taskText: task.text,
          completed: task.completed,
        });
        eventsByDate.set(task.dueDate, existing);
      }
    }
  }

  const todayIso = formatDateToISO(new Date());

  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] =
    [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, day);
    const dateStr = formatDateToISO(prevDate);
    cells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: false,
      isToday: dateStr === todayIso,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(year, month, d);
    const dateStr = formatDateToISO(dObj);
    cells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayIso,
    });
  }

  const remainingCells = 42 - cells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const dObj = new Date(year, month + 1, d);
    const dateStr = formatDateToISO(dObj);
    cells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayIso,
    });
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group justify="space-between" align="center" style={{ width: '100%' }}>
          <Group gap="sm">
            <ThemeIcon color="gray" variant="light" size="lg" radius="md">
              <IconCalendar size={18} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="md">
                Construction Master Calendar
              </Text>
              <Text size="xs" c="dimmed">
                Project Due Dates & Scheduled Field Tasks
              </Text>
            </div>
          </Group>

          <Group gap="xs" mr="xl">
            <Button size="xs" variant="default" onClick={handleToday}>
              Today
            </Button>
            <Group gap={4}>
              <ActionIcon
                variant="default"
                size="sm"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
              >
                <IconChevronLeft size={14} />
              </ActionIcon>
              <Text size="xs" fw={700} style={{ minWidth: 120, textAlign: 'center' }}>
                {monthName}
              </Text>
              <ActionIcon
                variant="default"
                size="sm"
                onClick={handleNextMonth}
                aria-label="Next Month"
              >
                <IconChevronRight size={14} />
              </ActionIcon>
            </Group>
          </Group>
        </Group>
      }
      size="90%"
      radius="md"
    >
      <Stack gap="sm">
        {/* Legend */}
        <Paper p="xs" radius="md" withBorder>
          <Group gap="md">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Legend:
            </Text>
            <Badge color="yellow" variant="light" size="xs">
              Project Due Date
            </Badge>
            <Badge color="blue" variant="light" size="xs">
              Scheduled Task
            </Badge>
            <Badge color="teal" variant="light" size="xs">
              Completed
            </Badge>
          </Group>
        </Paper>

        {/* Weekday headers */}
        <SimpleGrid cols={7} spacing="xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} size="xs" fw={700} c="dimmed" ta="center" tt="uppercase">
              {day}
            </Text>
          ))}
        </SimpleGrid>

        {/* 42 Calendar Cells Grid */}
        <SimpleGrid cols={7} spacing="xs">
          {cells.map((cell) => {
            const dayEvents = eventsByDate.get(cell.dateStr) || [];

            return (
              <Paper
                key={cell.dateStr}
                p={6}
                radius="sm"
                withBorder
                style={{
                  minHeight: 95,
                  opacity: cell.isCurrentMonth ? 1 : 0.4,
                  borderColor: cell.isToday ? 'var(--mantine-primary-color-filled)' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Group justify="space-between" align="center" mb={4}>
                  <Text size="xs" fw={cell.isToday ? 800 : 600}>
                    {cell.dayNum}
                  </Text>
                  {dayEvents.length > 0 && (
                    <Badge size="xs" variant="light" color="gray">
                      {dayEvents.length}
                    </Badge>
                  )}
                </Group>

                <ScrollArea.Autosize mah={65} scrollbarSize={4}>
                  <Stack gap={2}>
                    {dayEvents.map((evt, eIdx) => {
                      const isDue = evt.type === 'project_due';
                      const badgeColor = evt.completed ? 'teal' : isDue ? 'yellow' : 'blue';

                      return (
                        <Paper
                          key={eIdx}
                          p={3}
                          radius="xs"
                          withBorder
                          style={{
                            borderColor: `var(--mantine-color-${badgeColor}-6)`,
                          }}
                        >
                          <Group gap={3} wrap="nowrap">
                            {isDue ? (
                              <IconFlag size={10} color="var(--mantine-color-yellow-6)" />
                            ) : (
                              <IconSquareCheck size={10} color="var(--mantine-color-blue-6)" />
                            )}
                            <Text size="10px" fw={700} truncate style={{ flex: 1 }}>
                              {evt.projectName}
                            </Text>
                          </Group>
                          {evt.taskText && (
                            <Text size="9px" c="dimmed" truncate pl={12}>
                              {evt.taskText}
                            </Text>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                </ScrollArea.Autosize>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Modal>
  );
};
