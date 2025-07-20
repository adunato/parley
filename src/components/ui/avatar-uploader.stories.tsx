import type { Meta, StoryObj } from "@storybook/react";
import AvatarUploader from "./avatar-uploader";

const meta: Meta<typeof AvatarUploader> = {
  title: "Components/AvatarUploader",
  component: AvatarUploader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    currentAvatar: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentAvatar: "",
    size: 120,
  },
};

export const WithExistingAvatar: Story = {
  args: {
    currentAvatar: "https://github.com/shadcn.png",
    size: 150,
  },
};

export const LargerSize: Story = {
    args: {
      currentAvatar: "",
      size: 200,
    },
};
