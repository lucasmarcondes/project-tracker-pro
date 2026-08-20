import { Button, Group, Modal, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck, IconTrash } from '@tabler/icons-react';
import type React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  details?: { label: string; value: string }[];
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'success' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      opened={isOpen}
      onClose={onCancel}
      title={
        <Group gap="sm">
          <ThemeIcon
            color={variant === 'danger' ? 'red' : variant === 'success' ? 'teal' : 'amber'}
            variant="light"
            size="lg"
            radius="md"
          >
            {variant === 'danger' && <IconTrash size={20} />}
            {variant === 'success' && <IconCircleCheck size={20} />}
            {variant === 'primary' && <IconAlertTriangle size={20} />}
          </ThemeIcon>
          <Text fw={800} size="lg">
            {title}
          </Text>
        </Group>
      }
      centered
      radius="lg"
      shadow="xl"
    >
      <Stack gap="md">
        {message && (
          <Text size="sm" c="dimmed">
            {message}
          </Text>
        )}

        {details && details.length > 0 && (
          <Paper p="sm" radius="md" withBorder bg="rgba(0, 0, 0, 0.2)">
            <Stack gap={6}>
              {details.map((d, idx) => (
                <Group key={idx} justify="space-between">
                  <Text size="xs" c="dimmed" fw={600}>
                    {d.label}:
                  </Text>
                  <Text size="xs" fw={800}>
                    {d.value}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="default" onClick={onCancel} radius="md">
            {cancelText}
          </Button>
          <Button
            color={variant === 'danger' ? 'red' : variant === 'success' ? 'teal' : 'amber'}
            c={variant === 'primary' ? 'dark.9' : undefined}
            onClick={onConfirm}
            radius="md"
            fw={800}
          >
            {confirmText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
