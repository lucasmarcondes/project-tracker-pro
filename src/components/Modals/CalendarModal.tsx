import {
  ActionIcon,
  Badge,
  Box,
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
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatDateToISO(new Date()));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateToISO(today));
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

  const selectedEvents = eventsByDate.get(selectedDateStr) || [];

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
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
      }
      size="90%"
      radius="md"
    >
      <Stack gap="sm">
        {/* Month Navigation & Controls */}
        <Paper p="xs" radius="md" withBorder>
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap="xs">
              <Button size="xs" variant="default" onClick={handleToday} radius="sm">
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
                <Text size="xs" fw={700} style={{ minWidth: 110, textAlign: 'center' }}>
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

            {/* Legend */}
            <Group gap="xs" wrap="wrap">
              <Badge color="yellow" variant="light" size="xs">
                Project Due
              </Badge>
              <Badge color="blue" variant="light" size="xs">
                Scheduled Task
              </Badge>
              <Badge color="teal" variant="light" size="xs">
                Completed
              </Badge>
            </Group>
          </Group>
        </Paper>

        {/* Weekday headers */}
        <SimpleGrid cols={7} spacing={{ base: 4, sm: 'xs' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} size="xs" fw={700} c="dimmed" ta="center" tt="uppercase">
              {day}
            </Text>
          ))}
        </SimpleGrid>

        {/* 42 Calendar Cells Grid */}
        <SimpleGrid cols={7} spacing={{ base: 4, sm: 'xs' }}>
          {cells.map((cell) => {
            const dayEvents = eventsByDate.get(cell.dateStr) || [];
            const isSelected = cell.dateStr === selectedDateStr;

            return (
              <Paper
                key={cell.dateStr}
                p={{ base: 4, sm: 6 }}
                radius="sm"
                withBorder
                onClick={() => setSelectedDateStr(cell.dateStr)}
                style={{
                  minHeight: 48,
                  cursor: 'pointer',
                  opacity: cell.isCurrentMonth ? 1 : 0.4,
                  borderColor: isSelected
                    ? 'var(--mantine-primary-color-filled)'
                    : cell.isToday
                      ? 'var(--mantine-color-blue-5)'
                      : undefined,
                  borderWidth: isSelected || cell.isToday ? 2 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.15s ease',
                }}
              >
                <Group justify="space-between" align="center" mb={{ base: 2, sm: 4 }}>
                  <Text size="xs" fw={cell.isToday || isSelected ? 800 : 600}>
                    {cell.dayNum}
                  </Text>
                  {dayEvents.length > 0 && (
                    <Badge size="xs" variant="light" color="gray" px={4}>
                      {dayEvents.length}
                    </Badge>
                  )}
                </Group>

                {/* Mobile: Colored dots for events */}
                <Group gap={3} hiddenFrom="sm" justify="center" mt="auto">
                  {dayEvents.slice(0, 3).map((evt, idx) => {
                    const isDue = evt.type === 'project_due';
                    const color = evt.completed ? 'teal' : isDue ? 'yellow' : 'blue';
                    return (
                      <Box
                        key={idx}
                        w={5}
                        h={5}
                        style={{
                          borderRadius: '50%',
                          backgroundColor: `var(--mantine-color-${color}-6)`,
                        }}
                      />
                    );
                  })}
                </Group>

                {/* Desktop: Detailed Event Cards */}
                <Box visibleFrom="sm" style={{ flex: 1 }}>
                  <ScrollArea.Autosize mah={60} scrollbarSize={4}>
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
                </Box>
              </Paper>
            );
          })}
        </SimpleGrid>

        {/* Selected Day Agenda View */}
        <Paper p="sm" radius="md" withBorder bg="var(--mantine-color-default-hover)">
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Scheduled for {selectedDateStr}
              </Text>
              <Badge size="xs" variant="light" color="gray">
                {selectedEvents.length} items
              </Badge>
            </Group>

            {selectedEvents.length === 0 ? (
              <Text size="xs" c="dimmed" fs="italic">
                No project deadlines or tasks scheduled for this date.
              </Text>
            ) : (
              <Stack gap={6}>
                {selectedEvents.map((evt, idx) => {
                  const isDue = evt.type === 'project_due';
                  const badgeColor = evt.completed ? 'teal' : isDue ? 'yellow' : 'blue';

                  return (
                    <Paper key={idx} p="xs" radius="sm" withBorder bg="var(--mantine-color-body)">
                      <Group justify="space-between" align="center" wrap="nowrap">
                        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                          <ThemeIcon color={badgeColor} variant="light" size="sm" radius="sm">
                            {isDue ? <IconFlag size={13} /> : <IconSquareCheck size={13} />}
                          </ThemeIcon>
                          <Stack gap={1} style={{ minWidth: 0 }}>
                            <Text size="xs" fw={700} truncate>
                              {evt.projectName} (#{evt.projectNo})
                            </Text>
                            {evt.taskText && (
                              <Text size="xs" c="dimmed" truncate>
                                {evt.taskText}
                              </Text>
                            )}
                          </Stack>
                        </Group>

                        <Badge color={badgeColor} variant="light" size="xs" radius="sm" fw={700}>
                          {evt.completed ? 'Completed' : isDue ? 'Project Due' : 'Task Scheduled'}
                        </Badge>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Modal>
  );
};
