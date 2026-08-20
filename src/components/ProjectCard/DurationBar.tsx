import { Badge, Group, Progress, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconClock } from '@tabler/icons-react';
import type React from 'react';
import { calculateDurationRemaining, getDurationColor } from '../../utils/dates';

interface DurationBarProps {
  createdDate: string;
  dueDate: string;
}

export const DurationBar: React.FC<DurationBarProps> = ({ createdDate, dueDate }) => {
  const { percent, isOverdue, daysRemaining, totalDays } = calculateDurationRemaining(
    createdDate,
    dueDate,
  );
  const colorInfo = getDurationColor(percent, isOverdue);

  // Map colorName to Mantine colors
  const mantineColor =
    colorInfo.colorName === 'green'
      ? 'teal'
      : colorInfo.colorName === 'yellow'
        ? 'yellow'
        : colorInfo.colorName === 'orange'
          ? 'orange'
          : 'red';

  return (
    <Stack gap={6}>
      <Group justify="space-between" align="center">
        <Group gap={6}>
          <IconClock size={14} color="var(--mantine-color-dimmed)" />
          <Text size="xs" fw={700} c="dimmed">
            Project Timeline
          </Text>
        </Group>

        <Group gap="xs">
          {isOverdue ? (
            <Group gap={4}>
              <IconAlertTriangle size={14} color="var(--mantine-color-red-5)" />
              <Text size="xs" fw={800} c="red.5">
                {Math.abs(daysRemaining)} {Math.abs(daysRemaining) === 1 ? 'day' : 'days'} Past Due
              </Text>
            </Group>
          ) : (
            <Text size="xs" fw={700}>
              {daysRemaining} of {totalDays} {totalDays === 1 ? 'day' : 'days'} left
            </Text>
          )}

          <Badge color={mantineColor} variant="light" size="sm" radius="sm" fw={800} tt="uppercase">
            {isOverdue ? '0% Remaining' : `${percent}% Remaining`}
          </Badge>
        </Group>
      </Group>

      <Progress
        value={isOverdue ? 100 : percent}
        color={mantineColor}
        size="sm"
        radius="xl"
        animated={isOverdue}
      />
    </Stack>
  );
};
