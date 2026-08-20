import {
  ActionIcon,
  Button,
  Center,
  Flex,
  Group,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconBook2,
  IconBriefcase,
  IconCalendar,
  IconCircleCheck,
  IconDatabase,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import type React from 'react';
import type { SortOption, TabMode, ViewMode } from '../../types/project';

interface ControlsBarProps {
  activeTab: TabMode;
  onTabChange: (tab: TabMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenCreateModal: () => void;
  onOpenCalendarModal: () => void;
  onOpenImportExportModal: () => void;
  isNotepadOpen: boolean;
  onToggleNotepad: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenCreateModal,
  onOpenCalendarModal,
  onOpenImportExportModal,
  isNotepadOpen,
  onToggleNotepad,
}) => {
  return (
    <Stack gap="md">
      {/* Top Main Navigation & Action Bar */}
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        {/* Tabs: Active Jobs vs Completed Jobs */}
        <SegmentedControl
          value={activeTab}
          onChange={(val) => onTabChange(val as TabMode)}
          size="sm"
          radius="md"
          data={[
            {
              value: 'active',
              label: (
                <Center style={{ gap: 6 }}>
                  <IconBriefcase size={15} />
                  <span>Active Jobs</span>
                </Center>
              ),
            },
            {
              value: 'completed',
              label: (
                <Center style={{ gap: 6 }}>
                  <IconCircleCheck size={15} />
                  <span>Completed Jobs</span>
                </Center>
              ),
            },
          ]}
        />

        {/* Global Action Buttons */}
        <Group gap="xs" wrap="wrap">
          <Button
            variant="default"
            radius="md"
            size="sm"
            leftSection={<IconCalendar size={15} />}
            onClick={onOpenCalendarModal}
            fw={600}
          >
            Calendar
          </Button>

          <Tooltip label="Import / Export Backup">
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={onOpenImportExportModal}
              aria-label="Database Backup"
            >
              <IconDatabase size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={isNotepadOpen ? 'Hide Global Notepad' : 'Show Global Notepad'}>
            <Button
              variant={isNotepadOpen ? 'light' : 'default'}
              size="sm"
              radius="md"
              leftSection={<IconBook2 size={15} />}
              onClick={onToggleNotepad}
              fw={600}
            >
              Notepad
            </Button>
          </Tooltip>

          <Button
            variant="filled"
            size="sm"
            radius="md"
            leftSection={<IconPlus size={16} stroke={2.5} />}
            onClick={onOpenCreateModal}
            fw={700}
          >
            New Project
          </Button>
        </Group>
      </Group>

      {/* Filter, Search & View Controls Bar */}
      <Paper p="xs" radius="md" withBorder>
        <Flex
          justify="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap="sm"
        >
          {/* Search Input */}
          <TextInput
            flex={1}
            placeholder="Search projects by name, number, or template..."
            leftSection={<IconSearch size={15} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  c="dimmed"
                  onClick={() => onSearchChange('')}
                >
                  <IconX size={13} />
                </ActionIcon>
              ) : null
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            radius="md"
            size="sm"
          />

          <Group gap="xs" wrap="nowrap">
            {/* Sort Dropdown */}
            <Select
              value={sortOption}
              onChange={(val) => val && onSortChange(val as SortOption)}
              data={[
                { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
                { value: 'projectNo', label: 'Project Number (Lowest → Highest)' },
                { value: 'dueDate', label: 'Due Date (Soonest)' },
                { value: 'timeRemaining', label: 'Time Remaining (Urgent)' },
              ]}
              radius="md"
              size="sm"
              allowDeselect={false}
              w={{ base: '100%', sm: 220 }}
            />

            {/* View Mode Toggle: Details vs Compact */}
            <SegmentedControl
              value={viewMode}
              onChange={(val) => onViewModeChange(val as ViewMode)}
              size="sm"
              radius="md"
              data={[
                {
                  value: 'details',
                  label: (
                    <Center style={{ gap: 6, padding: '0 4px' }}>
                      <IconList size={16} />
                      <span>Details</span>
                    </Center>
                  ),
                },
                {
                  value: 'compact',
                  label: (
                    <Center style={{ gap: 6, padding: '0 4px' }}>
                      <IconLayoutGrid size={16} />
                      <span>Compact</span>
                    </Center>
                  ),
                },
              ]}
            />
          </Group>
        </Flex>
      </Paper>
    </Stack>
  );
};
