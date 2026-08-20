import {
  Alert,
  Button,
  Divider,
  FileInput,
  Group,
  Modal,
  Paper,
  Radio,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconDatabase,
  IconDownload,
  IconFileCode,
  IconRefresh,
  IconUpload,
} from '@tabler/icons-react';
import type React from 'react';
import { useState } from 'react';
import {
  type BackupData,
  exportDatabaseBackup,
  importDatabaseBackup,
  validateBackupData,
} from '../../db/exportImport';
import { bulkSaveProjects, clearAllProjects } from '../../db/idb';
import { generateSampleProjects } from '../../utils/sampleData';
import { ConfirmModal } from './ConfirmModal';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  onToast: (title: string, description?: string, type?: 'success' | 'error') => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  onToast,
}) => {
  const [importedBackup, setImportedBackup] = useState<BackupData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmImport, setShowConfirmImport] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    try {
      await exportDatabaseBackup();
      onToast('Backup Exported', 'JSON database backup downloaded successfully.');
    } catch {
      onToast('Export Failed', 'Could not export database backup.', 'error');
    }
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (!file) {
      setImportedBackup(null);
      setImportError(null);
      return;
    }

    setImportError(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target?.result as string);
        const result = validateBackupData(rawJson);

        if (!result.valid || !result.data) {
          setImportError(result.error || 'Invalid backup file format');
          setImportedBackup(null);
          return;
        }

        setImportedBackup(result.data);
      } catch {
        setImportError('Failed to parse file. Please ensure it is a valid JSON file.');
        setImportedBackup(null);
      }
    };

    reader.readAsText(file);
  };

  const executeImport = async () => {
    if (!importedBackup) return;
    setIsProcessing(true);
    try {
      const res = await importDatabaseBackup(importedBackup, importMode);
      setShowConfirmImport(false);
      setImportedBackup(null);
      setSelectedFile(null);
      onDataChanged();
      onToast(
        'Import Successful',
        `Restored ${res.projectCount} projects in ${importMode} mode.`,
        'success',
      );
      onClose();
    } catch {
      onToast('Import Failed', 'An error occurred during import.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToSample = async () => {
    setIsProcessing(true);
    try {
      await clearAllProjects();
      const samples = generateSampleProjects();
      await bulkSaveProjects(samples);
      setShowConfirmReset(false);
      onDataChanged();
      onToast('Sample Data Loaded', 'Restored initial sample construction jobs.', 'success');
      onClose();
    } catch {
      onToast('Reset Failed', 'Could not reset sample data.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={onClose}
        title={
          <Group gap="sm">
            <ThemeIcon color="gray" variant="light" size="lg" radius="md">
              <IconDatabase size={18} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="md">
                Data Backup & Restore
              </Text>
              <Text size="xs" c="dimmed">
                IndexedDB Storage Management
              </Text>
            </div>
          </Group>
        }
        centered
        radius="md"
        size="md"
      >
        <Stack gap="md">
          {/* Export Paper */}
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text size="sm" fw={700}>
                  Export JSON Backup
                </Text>
                <Text size="xs" c="dimmed">
                  Download all active/completed projects, tasks, notes log, and global notepad.
                </Text>
              </Stack>
              <Button
                variant="filled"
                size="xs"
                radius="md"
                leftSection={<IconDownload size={14} />}
                onClick={handleExport}
                fw={700}
              >
                Export
              </Button>
            </Group>
          </Paper>

          {/* Import Paper */}
          <Paper p="md" radius="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={700}>
                Import JSON Backup
              </Text>
              <Text size="xs" c="dimmed">
                Upload a verified backup file to restore your projects.
              </Text>

              <FileInput
                size="xs"
                placeholder="Choose JSON backup file"
                leftSection={<IconUpload size={14} />}
                accept=".json,application/json"
                value={selectedFile}
                onChange={handleFileChange}
                clearable
              />

              {importError && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Import Error"
                  color="red"
                  variant="light"
                  radius="md"
                >
                  {importError}
                </Alert>
              )}

              {importedBackup && (
                <Paper p="sm" radius="md" withBorder>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconCheck size={16} color="var(--mantine-color-teal-5)" />
                      <Text size="xs" fw={700} c="teal">
                        Valid Backup Verified ({importedBackup.projects.length} Projects found)
                      </Text>
                    </Group>

                    <Radio.Group
                      value={importMode}
                      onChange={(val) => setImportMode(val as 'replace' | 'merge')}
                    >
                      <Group gap="md">
                        <Radio value="replace" label="Replace All Data" size="xs" />
                        <Radio value="merge" label="Merge with Current" size="xs" />
                      </Group>
                    </Radio.Group>

                    <Button
                      variant="filled"
                      size="xs"
                      radius="md"
                      leftSection={<IconFileCode size={14} />}
                      onClick={() => setShowConfirmImport(true)}
                      disabled={isProcessing}
                      fw={700}
                      mt="xs"
                    >
                      Confirm & Apply Restore
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Paper>

          <Divider />

          {/* Reset To Sample */}
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              Want to start fresh with demo construction jobs?
            </Text>
            <Button
              variant="default"
              size="xs"
              radius="md"
              leftSection={<IconRefresh size={14} />}
              onClick={() => setShowConfirmReset(true)}
            >
              Reset Sample Data
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Confirmation for Import */}
      <ConfirmModal
        isOpen={showConfirmImport}
        title="Confirm Backup Restore"
        message={`Are you sure you want to restore ${importedBackup?.projects.length || 0} projects using "${importMode === 'replace' ? 'Replace All' : 'Merge'}" mode?`}
        confirmText="Restore Data"
        cancelText="Cancel"
        variant="primary"
        onConfirm={executeImport}
        onCancel={() => setShowConfirmImport(false)}
      />

      {/* Confirmation for Reset */}
      <ConfirmModal
        isOpen={showConfirmReset}
        title="Reset to Demo Data?"
        message="This will overwrite current projects with default construction sample jobs. Make sure you have exported a backup if you need to keep your current data."
        confirmText="Reset to Demo"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleResetToSample}
        onCancel={() => setShowConfirmReset(false)}
      />
    </>
  );
};
