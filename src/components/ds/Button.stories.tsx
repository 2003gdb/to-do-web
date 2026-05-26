import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "DS/Button",
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { label: "Save" } };
export const Secondary: Story = { args: { label: "Filter", variant: "secondary" } };
export const Ghost: Story = { args: { label: "Cancel", variant: "ghost" } };
export const Danger: Story = { args: { label: "Delete", variant: "danger" } };
export const Loading: Story = { args: { label: "Save", loading: true, loadingLabel: "Saving…" } };
