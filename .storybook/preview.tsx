import type { Preview } from '@storybook/nextjs';
import { useEffect } from 'react';
import { Inter, Cinzel, Oswald } from 'next/font/google';
import '../src/app/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });

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
          { value: 'demiplane-light', icon: 'starhollow', title: 'Demiplane Light' },
          { value: 'demiplane-dark', icon: 'star', title: 'Demiplane Dark' },
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

        // Remove older classes if any
        htmlTag.classList.remove('dark', 'demiplane-light', 'demiplane-dark');

        htmlTag.setAttribute('data-mode', theme);

        if (theme === 'dark' || theme === 'demiplane-dark') {
          htmlTag.classList.add('dark');
        }

        // Apply font variables to root to ensure visibility for :root variables in globals.css
        htmlTag.classList.add(inter.variable, cinzel.variable, oswald.variable);

        return () => {
          // Clean up on unmount or theme change if necessary, strictly speaking only necessary if distinct fonts per theme which is not the case here
          // but good practice to keep the DOM clean if we were switching. 
          // For now, adding is idempotent enough for this context as these are constant.
        };
      }, [theme]);

      // Determine wrapper class based on theme
      const getThemeClass = (themeName: string) => {
        if (themeName === 'dark' || themeName === 'demiplane-dark') {
          return 'dark';
        }
        return '';
      }

      return (
        <div className={`${getThemeClass(theme)} bg-background text-foreground min-h-screen p-4 font-sans`}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;