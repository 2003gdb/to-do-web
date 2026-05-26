import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = { component: Input, title: "DS/Input" };
export default meta;

type Story = StoryObj<typeof Input>;
export const Default: Story = { args: { placeholder: "you@example.com" } };
export const Filled: Story = { args: { defaultValue: "hello@world.dev" } };
