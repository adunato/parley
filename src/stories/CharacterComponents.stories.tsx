import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeader } from '@/components/ui/section-header';
import { StatBox } from '@/components/ui/stat-box';
import { ScoredStatCard } from '@/components/ui/scored-stat-card';
import { ScoredStatGroup } from '@/components/ui/scored-stat-group';
import { SkillList } from '@/components/ui/skill-list';
import { SkillGroup } from '@/components/ui/skill-group';

const meta = {
    title: 'Design System/Character UI',
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta;

export default meta;

// --- Section Header ---
export const Header: StoryObj<typeof SectionHeader> = {
    render: (args) => <div className="w-[300px]"><SectionHeader {...args} /></div>,
    args: {
        title: 'Attributes',
    },
};

// --- Stat Box ---
export const DotFilled: StoryObj<typeof StatBox> = {
    render: () => <StatBox filled={true} />,
};

export const DotEmpty: StoryObj<typeof StatBox> = {
    render: () => <StatBox filled={false} />,
};

// --- Scored Stat Card ---
export const StatCard: StoryObj<typeof ScoredStatCard> = {
    render: (args) => <div className="w-[300px]"><ScoredStatCard {...args} /></div>,
    args: {
        label: 'Strength',
        value: 3,
        max: 5,
    },
};

export const StatCardFull: StoryObj<typeof ScoredStatCard> = {
    render: (args) => <div className="w-[300px]"><ScoredStatCard {...args} /></div>,
    args: {
        label: 'Expertise',
        value: 5,
        max: 5,
    },
};

// --- Scored Stat Group ---
export const StatGroup: StoryObj<typeof ScoredStatGroup> = {
    render: (args) => (
        <div className="w-[300px]">
            <ScoredStatGroup {...args}>
                <ScoredStatCard label="Strength" value={3} />
                <ScoredStatCard label="Dexterity" value={2} />
                <ScoredStatCard label="Stamina" value={4} />
            </ScoredStatGroup>
        </div>
    ),
    args: {
        title: 'Physical',
    },
};

// --- Skills ---
export const SkillsList: StoryObj<typeof SkillList> = {
    render: (args) => <div className="w-[300px] border p-2"><SkillList {...args} /></div>,
    args: {
        skills: {
            "Athletics": 1,
            "Brawl": 2,
            "Drive": null,
            "Firearms": 3
        }
    },
};

export const SkillsGroup: StoryObj<typeof SkillGroup> = {
    render: (args) => (
        <div className="w-[300px]">
            <SkillGroup {...args}>
                <SkillList skills={{
                    "Athletics": 1,
                    "Brawl": 2,
                    "Drive": null,
                    "Firearms": 3
                }} />
            </SkillGroup>
        </div>
    ),
    args: {
        title: 'Physical Skills',
    },
};
