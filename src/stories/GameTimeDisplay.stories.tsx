import type { Meta, StoryObj } from '@storybook/react';
import { GameTimeDisplay } from '@/components/ui/game-time-display';

const meta = {
    title: 'UI/GameTimeDisplay',
    component: GameTimeDisplay,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        day: { control: 'number' },
        timeOfDay: {
            control: 'select',
            options: ['Morning', 'Afternoon', 'Evening', 'Night'],
        },
        weather: {
            control: 'select',
            options: ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Stormy', 'Clear'],
        },
    },
} satisfies Meta<typeof GameTimeDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Morning: Story = {
    args: {
        day: 1,
        timeOfDay: 'Morning',
        weather: 'Sunny',
    },
};

export const Afternoon: Story = {
    args: {
        day: 1,
        timeOfDay: 'Afternoon',
        weather: 'Sunny',
    },
};

export const Evening: Story = {
    args: {
        day: 1,
        timeOfDay: 'Evening',
        weather: 'Sunny',
    },
};

export const Night: Story = {
    args: {
        day: 1,
        timeOfDay: 'Night',
        weather: 'Clear',
    },
};

export const Cloudy: Story = {
    args: {
        day: 2,
        timeOfDay: 'Afternoon',
        weather: 'Cloudy',
    },
};

export const Rainy: Story = {
    args: {
        day: 3,
        timeOfDay: 'Afternoon',
        weather: 'Rainy',
    },
};

export const Stormy: Story = {
    args: {
        day: 4,
        timeOfDay: 'Night',
        weather: 'Stormy',
    },
};

export const Snowy: Story = {
    args: {
        day: 5,
        timeOfDay: 'Morning',
        weather: 'Snowy',
    },
};
