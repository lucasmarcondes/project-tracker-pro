import {
  Alert,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconAlertCircle,
  IconBuilding,
  IconCalendar,
  IconHash,
  IconLayersLinked,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Project, ProjectTemplate } from '../../types/project';
import {
  calculateDueDateFromTemplate,
  formatDateToISO,
  getTasksForTemplate,
} from '../../utils/dates';
import { ConfirmModal } from './ConfirmModal';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

const TEMPLATES: ProjectTemplate[] = [
  'No Template',
  'Addition/Renovation',
  'Reclad',
  'Fire Damage Repair',
  'Water Damage Repair',
  'Tree Strike',
  'Vehicle Impact',
  'New Construction',
  'Report',
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [projectNo, setProjectNo] = useState('');
  const [projectName, setProjectName] = useState('');
  const [template, setTemplate] = useState<ProjectTemplate>('Addition/Renovation');
  const [dueDate, setDueDate] = useState<string | null>(() =>
    calculateDueDateFromTemplate('Addition/Renovation'),
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleTemplateChange = (val: string | null) => {
    if (!val) return;
    const newTemplate = val as ProjectTemplate;
    setTemplate(newTemplate);
    const newDueDateStr = calculateDueDateFromTemplate(newTemplate);
    setDueDate(newDueDateStr);
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectNo.trim()) {
      setValidationError('Please enter a Project Number');
      return;
    }
    if (!projectName.trim()) {
      setValidationError('Please enter a Project Name');
      return;
    }
    if (!dueDate) {
      setValidationError('Please select a Due Date');
      return;
    }
    setValidationError('');
    setShowConfirm(true);
  };

  const handleConfirmCreate = () => {
    const createdDate = formatDateToISO(new Date());
    const dueDateStr = dueDate || formatDateToISO(new Date());
    const initialTasks = getTasksForTemplate(template).map((text, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      text,
      completed: false,
    }));

    const newProject: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectNo: projectNo.trim(),
      projectName: projectName.trim(),
      template,
      createdDate,
      dueDate: dueDateStr,
      completed: false,
      collapsedSections: { tasks: false, notes: false },
      taskList: initialTasks,
      notesLog: [],
    };

    onCreateProject(newProject);
    setShowConfirm(false);

    // Clear form and reset
    setProjectNo('');
    setProjectName('');
    setTemplate('Addition/Renovation');
    setDueDate(calculateDueDateFromTemplate('Addition/Renovation'));
    onClose();

    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 150);
  };

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={onClose}
        title={
          <Group gap="sm">
            <ThemeIcon color="gray" variant="light" size="lg" radius="md">
              <IconPlus size={18} />
            </ThemeIcon>
            <Text fw={700} size="md">
              New Construction Project
            </Text>
          </Group>
        }
        centered
        radius="md"
        size="lg"
      >
        <form onSubmit={handleOpenConfirm}>
          <Stack gap="md">
            {validationError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Required Information Missing"
                color="red"
                variant="light"
                radius="md"
              >
                {validationError}
              </Alert>
            )}

            <TextInput
              ref={nameInputRef}
              label="Project Name"
              description="Primary job name (e.g. Smith Residence)"
              placeholder="e.g. Smith Residence"
              leftSection={<IconBuilding size={16} />}
              value={projectName}
              onChange={(e) => setProjectName(e.currentTarget.value)}
              required
              radius="md"
            />

            <TextInput
              label="Project Number"
              description="Tracking or contract number"
              placeholder="e.g. 12345 or PRJ-2026-01"
              leftSection={<IconHash size={16} />}
              value={projectNo}
              onChange={(e) => setProjectNo(e.currentTarget.value)}
              required
              radius="md"
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Select
                label="Template"
                description="Auto-fills standard duration"
                data={TEMPLATES.map((t) => ({ value: t, label: t }))}
                value={template}
                onChange={handleTemplateChange}
                leftSection={<IconLayersLinked size={16} />}
                allowDeselect={false}
                radius="md"
              />

              <DateInput
                label="Due Date"
                description="Auto-calculated from template"
                placeholder="Select date"
                valueFormat="YYYY-MM-DD"
                leftSection={<IconCalendar size={16} />}
                value={dueDate}
                onChange={setDueDate}
                required
                radius="md"
                clearable
              />
            </SimpleGrid>

            {template !== 'No Template' && template !== 'Report' && (
              <Paper p="sm" radius="md" withBorder>
                <Group gap={6} mb={4}>
                  <IconSparkles size={14} />
                  <Text size="xs" fw={700}>
                    Auto-Generated Tasks (8 milestones)
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Permitting, Marketing/APS, Retainer, Site Visits, Draft Floor Plans, Redmarks, PIC
                  Review.
                </Text>
              </Paper>
            )}

            <Group justify="flex-end" gap="sm" mt="md">
              <Button variant="default" onClick={onClose} radius="md">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="filled"
                leftSection={<IconPlus size={15} />}
                radius="md"
                fw={700}
              >
                Add Project
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Confirmation Step Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Create Project?"
        details={[
          { label: 'Project No', value: projectNo },
          { label: 'Project Name', value: projectName },
          { label: 'Template', value: template },
          { label: 'Due Date', value: dueDate || '' },
        ]}
        confirmText="Create"
        cancelText="Cancel"
        variant="primary"
        onConfirm={handleConfirmCreate}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
