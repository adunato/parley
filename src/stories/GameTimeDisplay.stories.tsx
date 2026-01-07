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
        weather: {
            control: 'select',
            options: ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Stormy', 'Clear Night'],
        },
    },
} satisfies Meta<typeof GameTimeDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        day: 1,
        weather: 'Sunny',
    },
};

export const Cloudy: Story = {
    args: {
        day: 2,
        weather: 'Cloudy',
    },
};

export const Rainy: Story = {
    args: {
        day: 3,
        weather: 'Rainy',
    },
};

export const Stormy: Story = {
    args: {
        day: 4,
        weather: 'Stormy',
    },
};

export const Snowy: Story = {
    args: {
        day: 5,
        weather: 'Snowy',
    },
};

export const Night: Story = {
    args: {
        day: 1,
        weather: 'Clear Night',
    },
};
