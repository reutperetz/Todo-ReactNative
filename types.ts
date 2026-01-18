import type { Dispatch, SetStateAction } from 'react';

export type Task = {
  id: string;
  name: string;
  description: string;
  category: string;
};

export type RootStackParamList = {
  TaskList: undefined;
  AddTask: { tasks: Task[]; setTasks: Dispatch<SetStateAction<Task[]>> };
};
