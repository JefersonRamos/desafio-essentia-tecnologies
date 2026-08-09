export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly done: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface NewTask {
  title: string;
  description?: string | null;
}

export interface TaskChanges {
  title?: string;
  description?: string | null;
  done?: boolean;
}
