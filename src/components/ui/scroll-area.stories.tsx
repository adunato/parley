import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './scroll-area';

const meta = {
    title: 'UI/ScrollArea',
    component: ScrollArea,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4" {...args}>
            Jokester began sneaking into the castle in the middle of the night and leaving
            jokes all over the place: under the king's pillow, in his soup, even in the
            royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
            then, one day, the people of the kingdom discovered that the jokes were
            actually funny, and they started laughing. And then they started dancing. And
            then they started singing. And then they started playing. And then they
            started having fun.
            <br /><br />
            And the king, seeing how happy his people were, realized that he had been
            worrying about the wrong things. He realized that the most important thing
            wasn't power, or wealth, or status. It was happiness. So he decided to step
            down and let Jokester become the new king. And Jokester was a great king. He
            ruled with kindness, and humor, and compassion. And the kingdom flourished.
        </ScrollArea>
    ),
};
