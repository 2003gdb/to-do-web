import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = { component: Card, title: "DS/Card" };
export default meta;

type Story = StoryObj<typeof Card>;
export const Light: Story = {
  args: { children: <p className="text-neutral-900">Light card content</p> },
};
export const Dark: Story = {
  args: { dark: true, children: <p className="text-white">Dark card content</p> },
};
