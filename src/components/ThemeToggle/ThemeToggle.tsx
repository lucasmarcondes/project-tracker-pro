import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import type React from 'react';

export const ThemeToggle: React.FC = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

  const isDark = computedColorScheme === 'dark';

  const toggleColorScheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Tooltip label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}>
      <ActionIcon
        variant="default"
        size="lg"
        radius="md"
        onClick={toggleColorScheme}
        aria-label="Toggle Color Scheme"
      >
        {isDark ? (
          <IconSun size={18} stroke={1.5} color="var(--mantine-color-yellow-4)" />
        ) : (
          <IconMoon size={18} stroke={1.5} color="var(--mantine-color-dark-6)" />
        )}
      </ActionIcon>
    </Tooltip>
  );
};
