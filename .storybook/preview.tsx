import type { Preview } from '@storybook/nextjs';
import { useEffect } from 'react';
import { Inter, Cinzel } from 'next/font/google';
import '../src/app/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

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
        icon: 'paintbrush',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
          { value: 'demiplane_light', icon: 'starhollow', title: 'Demiplane Light' },
          { value: 'demiplane_dark', icon: 'star', title: 'Demiplane Dark' },
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

        // Reset classes
        htmlTag.classList.remove('dark', 'demiplane-light', 'demiplane-dark');

        if (theme === 'dark') {
          htmlTag.classList.add('dark');
          htmlTag.setAttribute('data-mode', 'dark');
        } else if (theme === 'demiplane_light') {
          htmlTag.classList.add('demiplane-light');
          htmlTag.setAttribute('data-mode', 'demiplane-light');
        } else if (theme === 'demiplane_dark') {
          htmlTag.classList.add('demiplane-dark', 'dark'); // Assuming dark mode utilities might still be useful, or we can just use the class
          htmlTag.setAttribute('data-mode', 'demiplane-dark');
        } else {
          htmlTag.setAttribute('data-mode', 'light');
        }
      }, [theme]);

      // Determine wrapper class based on theme
      const getThemeClass = (themeName: string) => {
        switch (themeName) {
          case 'dark': return 'dark';
          case 'demiplane_light': return 'demiplane-light';
          case 'demiplane_dark': return 'demiplane-dark dark'; // Append dark to piggyback on some dark utilities if needed
          default: return '';
        }
      }

      return (
        <div className={`${getThemeClass(theme)} ${inter.variable} ${cinzel.variable} bg-background text-foreground min-h-screen p-4 font-sans`}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;