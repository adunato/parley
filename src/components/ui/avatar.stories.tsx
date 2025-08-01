import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
      <div className="flex flex-row flex-wrap items-center gap-12">
          <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
              <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar className="rounded-lg">
              <AvatarImage
                  src="https://github.com/evilrabbit.png"
                  alt="@evilrabbit"
              />
              <AvatarFallback>ER</AvatarFallback>
          </Avatar>
          <div
              className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
              <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
                  <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                  <AvatarImage src="https://github.com/leerob.png" alt="@leerob"/>
                  <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar>
                  <AvatarImage
                      src="https://github.com/evilrabbit.png"
                      alt="@evilrabbit"
                  />
                  <AvatarFallback>ER</AvatarFallback>
              </Avatar>
          </div>
      </div>
  ),
};