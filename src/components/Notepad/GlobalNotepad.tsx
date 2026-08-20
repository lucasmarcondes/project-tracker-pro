import {
  ActionIcon,
  Badge,
  Divider,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconBook2,
  IconCheck,
  IconHighlight,
  IconList,
  IconListNumbers,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { getNotepadContent, saveNotepadContent } from '../../db/idb';

interface GlobalNotepadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalNotepad: React.FC<GlobalNotepadProps> = ({ isOpen, onClose }) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    getNotepadContent().then((content) => {
      if (editorRef.current && content) {
        editorRef.current.innerHTML = content;
      }
    });
  }, []);

  const triggerAutoSave = () => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(async () => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        await saveNotepadContent(html);
        setSaveStatus('saved');
      }
    }, 600);
  };

  const executeCommand = (command: string, value = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    triggerAutoSave();
  };

  const handleClearNotepad = () => {
    if (window.confirm('Clear notepad content?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        triggerAutoSave();
      }
    }
  };

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      position="right"
      size="100%"
      maw={{ base: '100%', sm: 460 }}
      title={
        <Group gap="sm">
          <ThemeIcon color="gray" variant="light" size="lg" radius="md">
            <IconBook2 size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700} size="sm">
              Global Notepad
            </Text>
            <Group gap={6}>
              {saveStatus === 'saving' ? (
                <Text size="10px" fw={600} c="dimmed">
                  Saving...
                </Text>
              ) : (
                <Group gap={3}>
                  <IconCheck size={11} color="var(--mantine-color-teal-5)" />
                  <Text size="10px" fw={600} c="teal">
                    Auto-Saved to DB
                  </Text>
                </Group>
              )}
            </Group>
          </div>
        </Group>
      }
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 60px)',
          padding: 0,
        },
      }}
    >
      <Stack gap={0} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Paper p="xs" withBorder radius={0}>
          <Group justify="space-between" align="center">
            <Group gap={4}>
              <Tooltip label="Bold (Ctrl+B / ⌘B)">
                <ActionIcon variant="subtle" color="gray" onClick={() => executeCommand('bold')}>
                  <IconBold size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Highlight">
                <ActionIcon
                  variant="subtle"
                  color="yellow"
                  onClick={() => executeCommand('hiliteColor', '#fef08a')}
                >
                  <IconHighlight size={15} />
                </ActionIcon>
              </Tooltip>

              <Divider orientation="vertical" />

              <Tooltip label="Bulleted List (• Item)">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => executeCommand('insertUnorderedList')}
                >
                  <IconList size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Numbered List (1. Item)">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => executeCommand('insertOrderedList')}
                >
                  <IconListNumbers size={15} />
                </ActionIcon>
              </Tooltip>

              <Divider orientation="vertical" />

              <Tooltip label="Undo">
                <ActionIcon variant="subtle" color="gray" onClick={() => executeCommand('undo')}>
                  <IconArrowBackUp size={15} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Redo">
                <ActionIcon variant="subtle" color="gray" onClick={() => executeCommand('redo')}>
                  <IconArrowForwardUp size={15} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Tooltip label="Clear Notepad">
              <ActionIcon variant="subtle" color="red" onClick={handleClearNotepad}>
                <IconTrash size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Paper>

        {/* Editable Body */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div
            ref={editorRef}
            contentEditable
            onInput={triggerAutoSave}
            onBlur={triggerAutoSave}
            style={{
              minHeight: '100%',
              outline: 'none',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'inherit',
            }}
            data-placeholder="Write field notes, subcontractor phone numbers, quick material estimates here..."
          />
        </div>

        {/* Footer */}
        <Paper p="xs" withBorder radius={0}>
          <Group justify="space-between" align="center">
            <Group gap={4}>
              <IconSparkles size={13} />
              <Text size="11px" c="dimmed">
                Persistent across all projects
              </Text>
            </Group>
            <Badge size="xs" variant="outline" color="gray">
              Rich Text
            </Badge>
          </Group>
        </Paper>
      </Stack>
    </Drawer>
  );
};
