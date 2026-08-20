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
  Text,
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
    <Stack gap="xs">
      {/* Top Main Navigation & Action Bar */}
      <Flex
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap="xs"
      >
        {/* Tabs: Active Jobs vs Completed Jobs */}
        <SegmentedControl
          value={activeTab}
          onChange={(val) => onTabChange(val as TabMode)}
          size="sm"
          radius="md"
          fullWidth
          style={{ maxWidth: 360 }}
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
          <Group gap="xs">
            <Tooltip label="Calendar Schedule">
              <Button
                variant="default"
                radius="md"
                size="sm"
                leftSection={<IconCalendar size={15} />}
                onClick={onOpenCalendarModal}
                fw={600}
                px={{ base: 'xs', sm: 'sm' }}
              >
                Calendar
              </Button>
            </Tooltip>

            <Tooltip label={isNotepadOpen ? 'Hide Global Notepad' : 'Show Global Notepad'}>
              <Button
                variant={isNotepadOpen ? 'light' : 'default'}
                size="sm"
                radius="md"
                leftSection={<IconBook2 size={15} />}
                onClick={onToggleNotepad}
                fw={600}
                px={{ base: 'xs', sm: 'sm' }}
              >
                Notepad
              </Button>
            </Tooltip>

            <Tooltip label="Import / Export Backup">
              <ActionIcon
                variant="default"
                size="36px"
                radius="md"
                onClick={onOpenImportExportModal}
                aria-label="Database Backup"
              >
                <IconDatabase size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Button
            variant="filled"
            size="sm"
            radius="md"
            leftSection={<IconPlus size={16} stroke={2.5} />}
            onClick={onOpenCreateModal}
            fw={700}
            flex={{ base: 1, sm: 'initial' }}
          >
            New Project
          </Button>
        </Group>
      </Flex>

      {/* Filter, Search & View Controls Bar */}
      <Paper p="xs" radius="md" withBorder>
        <Flex
          justify="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap="xs"
        >
          {/* Search Input */}
          <TextInput
            flex={1}
            placeholder="Search projects..."
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

          <Group gap="xs" wrap="wrap">
            {/* Sort Dropdown */}
            <Select
              value={sortOption}
              onChange={(val) => val && onSortChange(val as SortOption)}
              data={[
                { value: 'dueDate', label: 'Due Date (Soonest)' },
                { value: 'timeRemaining', label: 'Urgent Remaining' },
                { value: 'alphabetical', label: 'A-Z Name' },
                { value: 'projectNo', label: 'Project #' },
              ]}
              radius="md"
              size="sm"
              allowDeselect={false}
              flex={{ base: 1, sm: 'initial' }}
              w={{ base: '100%', xs: 180, sm: 200 }}
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
                    <Center style={{ gap: 4, padding: '0 2px' }}>
                      <IconList size={15} />
                      <Text size="xs" visibleFrom="xs">
                        Details
                      </Text>
                    </Center>
                  ),
                },
                {
                  value: 'compact',
                  label: (
                    <Center style={{ gap: 4, padding: '0 2px' }}>
                      <IconLayoutGrid size={15} />
                      <Text size="xs" visibleFrom="xs">
                        Compact
                      </Text>
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
