import type { Preview } from '@storybook/nextjs';
import { useEffect } from 'react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { theme } = context.globals;

      useEffect(() => {
        const htmlTag = document.documentElement;
        if (theme === 'dark') {
          htmlTag.classList.add('dark');
          htmlTag.setAttribute('data-mode', 'dark');
        } else {
          htmlTag.classList.remove('dark');
          htmlTag.setAttribute('data-mode', 'light');
        }
      }, [theme]);

      // We render the story within a provider-like div if needed, 
      // but since we modify documentElement, the class propagates.
      // However, we also want to set the background of the story container 
      // to match the theme immediately for better visualization.
      return (
        <div className={theme === 'dark' ? 'dark bg-background text-foreground min-h-screen p-4' : 'bg-background text-foreground min-h-screen p-4'}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;