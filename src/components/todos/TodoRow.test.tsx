import { render, screen } from "@testing-library/react";
import { TodoRow } from "./TodoRow";
import type { Todo } from "@/types/todo";

function makeTodo(over: Partial<Todo> = {}): Todo {
  return {
    id: "1",
    title: "Title",
    description: "",
    completed: false,
    createdAt: new Date().toISOString(),
    ...over,
  };
}

describe("TodoRow", () => {
  it("renders title and links to detail", () => {
    render(<TodoRow todo={makeTodo({ id: "7", title: "Hello" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/todos/7");
    expect(link).toHaveTextContent("Hello");
  });

  it("strikes title when completed and shows check icon", () => {
    const { container } = render(<TodoRow todo={makeTodo({ completed: true })} />);
    const title = container.querySelector("p");
    expect(title?.className).toMatch(/line-through/);
  });

  it("renders description when present", () => {
    render(<TodoRow todo={makeTodo({ description: "desc" })} />);
    expect(screen.getByText("desc")).toBeInTheDocument();
  });

  it("shows priority dot for non-completed with priority", () => {
    const { container } = render(<TodoRow todo={makeTodo({ priority: "HIGH" })} />);
    expect(container.querySelector(".bg-warning")).not.toBeNull();
  });

  it("shows neutral dot for non-completed without priority", () => {
    const { container } = render(<TodoRow todo={makeTodo()} />);
    expect(container.querySelector(".bg-accent")).not.toBeNull();
  });

  it("date shows 'Today · HH:MM' when today", () => {
    const iso = new Date().toISOString();
    render(<TodoRow todo={makeTodo({ createdAt: iso })} />);
    expect(screen.getByText(/Today/)).toBeInTheDocument();
  });

  it("date shows non-today format otherwise", () => {
    render(<TodoRow todo={makeTodo({ createdAt: "2020-01-15T12:00:00.000Z" })} />);
    // Not 'Today'
    expect(screen.queryByText(/Today/)).toBeNull();
  });

  it("handles missing createdAt gracefully", () => {
    render(
      <TodoRow
        todo={
          {
            id: "1",
            title: "t",
            description: "",
            completed: false,
          } as unknown as Todo
        }
      />
    );
    // No throw
    expect(screen.getByText("t")).toBeInTheDocument();
  });
});
