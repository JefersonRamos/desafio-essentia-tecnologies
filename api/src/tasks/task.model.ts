export type TaskId = string;

export interface Task {
  readonly id: TaskId;
  readonly title: string;
  readonly description: string | null;
  readonly done: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
