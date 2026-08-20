import { Badge, Group, Progress, Stack, Text } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import type React from 'react';
import type { TaskItem } from '../../types/project';

interface ProgressBarProps {
  taskList: TaskItem[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ taskList }) => {
  const total = taskList.length;
  const completed = taskList.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Stack gap={6}>
      <Group justify="space-between" align="center" wrap="wrap" gap={4}>
        <Group gap={6}>
          <IconCircleCheck size={14} color="var(--mantine-color-teal-5)" />
          <Text size="xs" fw={700} c="dimmed">
            Progress
          </Text>
        </Group>

        <Group gap="xs" wrap="wrap">
          <Text size="xs" fw={700}>
            {completed}/{total} {total === 1 ? 'task' : 'tasks'}
          </Text>
          <Badge color="blue" variant="light" size="sm" radius="sm" fw={800}>
            {percent}%
          </Badge>
        </Group>
      </Group>

      <Progress value={percent} color="blue" size="sm" radius="xl" />
    </Stack>
  );
};
