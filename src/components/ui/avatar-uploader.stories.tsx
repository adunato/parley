import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import AvatarUploader from "./avatar-uploader";
import { fn } from '@storybook/test';

const meta: Meta<typeof AvatarUploader> = {
  title: "Components/AvatarUploader",
  component: AvatarUploader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onAvatarChange: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveAvatarUploader = (args: Story["args"]) => {
  const [avatar, setAvatar] = useState(args?.currentAvatar || "");
  return (
    <AvatarUploader
      {...args}
      currentAvatar={avatar}
      onAvatarChange={(newAvatar) => {
        args?.onAvatarChange?.(newAvatar);
        setAvatar(newAvatar);
      }}
    />
  );
};

export const Default: Story = {
  args: {
    currentAvatar: "",
    size: 120,
  },
  render: (args) => <InteractiveAvatarUploader {...args} />,
};

export const WithExistingAvatar: Story = {
  args: {
    currentAvatar: "https://github.com/shadcn.png",
    size: 150,
  },
  render: (args) => <InteractiveAvatarUploader {...args} />,
};

export const LargerSize: Story = {
    args: {
      currentAvatar: "",
      size: 200,
    },
    render: (args) => <InteractiveAvatarUploader {...args} />,
};
