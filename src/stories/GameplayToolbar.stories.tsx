import type { Meta, StoryObj } from '@storybook/react'
import { GameplayToolbar } from '@/components/gameplay-toolbar'

const meta: Meta<typeof GameplayToolbar> = {
    title: 'Gameplay/Toolbar',
    component: GameplayToolbar,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        timeOfDay: {
            control: 'select',
            options: ['Morning', 'Afternoon', 'Evening', 'Night'],
        },
    },
}

export default meta
type Story = StoryObj<typeof GameplayToolbar>

export const Default: Story = {
    args: {
        currentDay: 1,
        timeOfDay: 'Morning',
        personaName: 'Marcus Aurelius',
        personaImageSrc: 'https://github.com/shadcn.png',
    },
}

export const Afternoon: Story = {
    args: {
        currentDay: 12,
        timeOfDay: 'Afternoon',
        personaName: 'Cleopatra',
    },
}

export const NightNoAvatar: Story = {
    args: {
        currentDay: 45,
        timeOfDay: 'Night',
    },
}
