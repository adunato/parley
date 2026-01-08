import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';

const meta = {
    title: 'UI/Textarea',
    component: Textarea,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: 'Type your message here.',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: 'Disabled textarea',
    },
};

export const WithValue: Story = {
    args: {
        defaultValue: 'Initial content...',
    },
};
