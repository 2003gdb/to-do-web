import type { Meta, StoryObj } from "@storybook/react";
import { Pill } from "./Pill";

const meta: Meta<typeof Pill> = { component: Pill, title: "DS/Pill" };
export default meta;

type Story = StoryObj<typeof Pill>;
export const Default: Story = { args: { label: "Today", dot: true } };
export const Success: Story = { args: { label: "Completed", tone: "success", dot: true } };
export const Danger: Story = { args: { label: "Overdue", tone: "danger" } };
export const Accent: Story = { args: { label: "Due Aug 12", tone: "accent" } };
