import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from '@mantine/core';
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconMessageCircle,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import type React from 'react';
import { useState } from 'react';
import type { NoteItem } from '../../types/project';
import { formatTimestamp } from '../../utils/dates';

interface NotesSectionProps {
  notesLog: NoteItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddNote: (text: string, timestamp: string) => void;
  onEditNote: (noteId: string, newText: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notesLog,
  isCollapsed,
  onToggleCollapse,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleStartAdd = () => {
    setIsAdding(true);
  };

  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteText.trim()) {
      const timestamp = formatTimestamp(new Date());
      onAddNote(newNoteText.trim(), timestamp);
      setNewNoteText('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const handleSaveEdit = (noteId: string) => {
    if (editingText.trim()) {
      onEditNote(noteId, editingText.trim());
    }
    setEditingNoteId(null);
  };

  return (
    <Paper radius="md" withBorder>
      {/* Collapsible Header */}
      <Box p="xs" bg="var(--mantine-color-default-hover)">
        <Group justify="space-between" align="center">
          <UnstyledButton onClick={onToggleCollapse} flex={1}>
            <Group gap="xs">
              {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
              <Text size="xs" fw={700} tt="uppercase">
                Notes Log
              </Text>
              <Badge size="xs" variant="light" color="gray">
                {notesLog.length}
              </Badge>
            </Group>
          </UnstyledButton>

          {!isCollapsed && (
            <Button
              size="xs"
              variant="light"
              color="gray"
              leftSection={<IconPlus size={12} />}
              onClick={handleStartAdd}
              radius="sm"
            >
              Add Note
            </Button>
          )}
        </Group>
      </Box>

      {/* Expanded Content */}
      <Box display={isCollapsed ? 'none' : 'block'}>
        <Stack p="sm" gap="xs">
          {/* Add Note Form */}
          {isAdding && (
            <Paper p="xs" radius="sm" withBorder>
              <form onSubmit={handleSaveNewNote}>
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Group gap={6}>
                      <IconMessageCircle size={14} />
                      <Text size="xs" fw={700}>
                        New Project Note
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {formatTimestamp(new Date())}
                    </Text>
                  </Group>

                  <Textarea
                    autoFocus
                    rows={2}
                    placeholder="Type note details (e.g. client feedback, site inspection findings)..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.currentTarget.value)}
                    size="xs"
                  />

                  <Group justify="flex-end" gap="xs">
                    <Button
                      size="xs"
                      variant="default"
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setNewNoteText('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="xs" variant="filled" fw={700} type="submit">
                      Save Note
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          )}

          {notesLog.length === 0 && !isAdding && (
            <Text size="xs" c="dimmed" fs="italic" ta="center" py="xs">
              No notes logged yet. Click &quot;Add Note&quot; above to log an entry.
            </Text>
          )}

          {notesLog.map((note) => {
            const isEditing = editingNoteId === note.id;

            return (
              <Paper key={note.id} p="xs" radius="sm" withBorder>
                <Stack gap={4}>
                  {/* Header: Timestamp & Edit Controls */}
                  <Group justify="space-between" align="center">
                    <Text size="xs" fw={700} c="dimmed" ff="monospace">
                      {note.timestamp}
                    </Text>

                    <Group gap={4}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => handleStartEdit(note)}
                        title="Edit note"
                      >
                        <IconPencil size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => onDeleteNote(note.id)}
                        title="Delete note"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  {/* Body */}
                  {isEditing ? (
                    <Stack gap="xs" mt="xs">
                      <Textarea
                        rows={2}
                        size="xs"
                        value={editingText}
                        onChange={(e) => setEditingText(e.currentTarget.value)}
                        autoFocus
                      />
                      <Group justify="flex-end" gap="xs">
                        <Button
                          size="compact-xs"
                          variant="default"
                          onClick={() => setEditingNoteId(null)}
                          leftSection={<IconX size={12} />}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="compact-xs"
                          variant="filled"
                          onClick={() => handleSaveEdit(note.id)}
                          leftSection={<IconCheck size={12} />}
                        >
                          Save
                        </Button>
                      </Group>
                    </Stack>
                  ) : (
                    <Text size="xs" fw={500} style={{ whiteSpace: 'pre-wrap' }}>
                      {note.text}
                    </Text>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};
