export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface TodoUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
}

export interface TodoCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface TodoComment {
  id: string;
  content: string;
  createdAt: string;
  authorEmail: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  priority?: Priority;
  parentId?: string;
  owner?: TodoUser;
  tasks?: Todo[];
  categories?: TodoCategory[];
  comments?: TodoComment[];
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  parentId?: string;
  priority?: Priority;
  dueDate?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
  priority?: Priority;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface RegisterUserDto {
  fullName: string;
  email: string;
  password: string;
}
