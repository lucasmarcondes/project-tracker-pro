import { Box, Group, Paper, SimpleGrid, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import {
  IconAlertOctagon,
  IconBriefcase,
  IconCircleCheck,
  IconClock,
  IconLayersLinked,
} from '@tabler/icons-react';
import type React from 'react';
import type { DashboardStats, TabMode } from '../../types/project';

interface StatsHeaderProps {
  stats: DashboardStats;
  activeTab: TabMode;
  onTabChange: (tab: TabMode) => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ stats, activeTab, onTabChange }) => {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
      {/* Active Projects */}
      <UnstyledButton onClick={() => onTabChange('active')}>
        <Paper
          p="md"
          radius="md"
          withBorder
          bg={activeTab === 'active' ? 'var(--mantine-color-default-hover)' : undefined}
        >
          <Group justify="space-between" mb="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Active Projects
            </Text>
            <ThemeIcon color="blue" variant="light" size="md" radius="md">
              <IconBriefcase size={16} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap="xs">
            <Text fz={26} fw={800} lh={1}>
              {stats.activeProjects}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              in progress
            </Text>
          </Group>
        </Paper>
      </UnstyledButton>

      {/* Completed Projects */}
      <UnstyledButton onClick={() => onTabChange('completed')}>
        <Paper
          p="md"
          radius="md"
          withBorder
          bg={activeTab === 'completed' ? 'var(--mantine-color-default-hover)' : undefined}
        >
          <Group justify="space-between" mb="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Completed
            </Text>
            <ThemeIcon color="teal" variant="light" size="md" radius="md">
              <IconCircleCheck size={16} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap="xs">
            <Text fz={26} fw={800} lh={1}>
              {stats.completedProjects}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              closed out
            </Text>
          </Group>
        </Paper>
      </UnstyledButton>

      {/* Past Due */}
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
            Past Due
          </Text>
          <ThemeIcon color="red" variant="light" size="md" radius="md">
            <IconAlertOctagon size={16} />
          </ThemeIcon>
        </Group>
        <Group align="baseline" gap="xs">
          <Text fz={26} fw={800} lh={1} c={stats.pastDue > 0 ? 'red' : undefined}>
            {stats.pastDue}
          </Text>
          <Text size="xs" c="dimmed" fw={500}>
            urgent
          </Text>
        </Group>
      </Paper>

      {/* Due This Week */}
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
            Due This Week
          </Text>
          <ThemeIcon color="yellow" variant="light" size="md" radius="md">
            <IconClock size={16} />
          </ThemeIcon>
        </Group>
        <Group align="baseline" gap="xs">
          <Text fz={26} fw={800} lh={1} c={stats.dueThisWeek > 0 ? 'yellow.8' : undefined}>
            {stats.dueThisWeek}
          </Text>
          <Text size="xs" c="dimmed" fw={500}>
            in 7 days
          </Text>
        </Group>
      </Paper>

      {/* Total Projects */}
      <Box>
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Total Projects
            </Text>
            <ThemeIcon color="gray" variant="light" size="md" radius="md">
              <IconLayersLinked size={16} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap="xs">
            <Text fz={26} fw={800} lh={1}>
              {stats.totalProjects}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              all tracked
            </Text>
          </Group>
        </Paper>
      </Box>
    </SimpleGrid>
  );
};
