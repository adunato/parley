import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta = {
    title: 'UI/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: 'text',
        placeholder: 'Email',
    },
};

export const File: Story = {
    args: {
        type: 'file',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: 'Disabled input',
    },
};

export const WithValue: Story = {
    args: {
        defaultValue: 'Some value',
    },
};
