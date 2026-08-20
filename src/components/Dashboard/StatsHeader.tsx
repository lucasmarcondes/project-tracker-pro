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
    <SimpleGrid cols={{ base: 2, xs: 3, md: 5 }} spacing={{ base: 'xs', sm: 'md' }}>
      {/* Active Projects */}
      <UnstyledButton onClick={() => onTabChange('active')}>
        <Paper
          p={{ base: 'xs', sm: 'md' }}
          radius="md"
          withBorder
          bg={activeTab === 'active' ? 'var(--mantine-color-default-hover)' : undefined}
          h="100%"
        >
          <Group justify="space-between" mb={{ base: 4, sm: 'xs' }}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Active
            </Text>
            <ThemeIcon color="blue" variant="light" size="sm" radius="md">
              <IconBriefcase size={15} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap={6}>
            <Text fz={{ base: 22, sm: 26 }} fw={800} lh={1}>
              {stats.activeProjects}
            </Text>
            <Text size="11px" c="dimmed" fw={500}>
              in progress
            </Text>
          </Group>
        </Paper>
      </UnstyledButton>

      {/* Completed Projects */}
      <UnstyledButton onClick={() => onTabChange('completed')}>
        <Paper
          p={{ base: 'xs', sm: 'md' }}
          radius="md"
          withBorder
          bg={activeTab === 'completed' ? 'var(--mantine-color-default-hover)' : undefined}
          h="100%"
        >
          <Group justify="space-between" mb={{ base: 4, sm: 'xs' }}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Completed
            </Text>
            <ThemeIcon color="teal" variant="light" size="sm" radius="md">
              <IconCircleCheck size={15} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap={6}>
            <Text fz={{ base: 22, sm: 26 }} fw={800} lh={1}>
              {stats.completedProjects}
            </Text>
            <Text size="11px" c="dimmed" fw={500}>
              closed out
            </Text>
          </Group>
        </Paper>
      </UnstyledButton>

      {/* Past Due */}
      <Paper p={{ base: 'xs', sm: 'md' }} radius="md" withBorder h="100%">
        <Group justify="space-between" mb={{ base: 4, sm: 'xs' }}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
            Past Due
          </Text>
          <ThemeIcon color="red" variant="light" size="sm" radius="md">
            <IconAlertOctagon size={15} />
          </ThemeIcon>
        </Group>
        <Group align="baseline" gap={6}>
          <Text fz={{ base: 22, sm: 26 }} fw={800} lh={1} c={stats.pastDue > 0 ? 'red' : undefined}>
            {stats.pastDue}
          </Text>
          <Text size="11px" c="dimmed" fw={500}>
            urgent
          </Text>
        </Group>
      </Paper>

      {/* Due This Week */}
      <Paper p={{ base: 'xs', sm: 'md' }} radius="md" withBorder h="100%">
        <Group justify="space-between" mb={{ base: 4, sm: 'xs' }}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
            This Week
          </Text>
          <ThemeIcon color="yellow" variant="light" size="sm" radius="md">
            <IconClock size={15} />
          </ThemeIcon>
        </Group>
        <Group align="baseline" gap={6}>
          <Text fz={{ base: 22, sm: 26 }} fw={800} lh={1} c={stats.dueThisWeek > 0 ? 'yellow.8' : undefined}>
            {stats.dueThisWeek}
          </Text>
          <Text size="11px" c="dimmed" fw={500}>
            in 7 days
          </Text>
        </Group>
      </Paper>

      {/* Total Projects */}
      <Box style={{ gridColumn: 'span 2 / span 2' }} hiddenFrom="xs">
        <Paper p="xs" radius="md" withBorder h="100%">
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Total Projects
            </Text>
            <ThemeIcon color="gray" variant="light" size="sm" radius="md">
              <IconLayersLinked size={15} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap={6}>
            <Text fz={22} fw={800} lh={1}>
              {stats.totalProjects}
            </Text>
            <Text size="11px" c="dimmed" fw={500}>
              all tracked
            </Text>
          </Group>
        </Paper>
      </Box>

      {/* Total Projects for xs and above */}
      <Box visibleFrom="xs">
        <Paper p={{ base: 'xs', sm: 'md' }} radius="md" withBorder h="100%">
          <Group justify="space-between" mb={{ base: 4, sm: 'xs' }}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Total Projects
            </Text>
            <ThemeIcon color="gray" variant="light" size="sm" radius="md">
              <IconLayersLinked size={15} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap={6}>
            <Text fz={{ base: 22, sm: 26 }} fw={800} lh={1}>
              {stats.totalProjects}
            </Text>
            <Text size="11px" c="dimmed" fw={500}>
              all tracked
            </Text>
          </Group>
        </Paper>
      </Box>
    </SimpleGrid>
  );
};
