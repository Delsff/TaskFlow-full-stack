export type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH';
export type StatusType = 'pending' | 'in-progress' | 'completed';

export interface Task {
  _id: string;
  title: string;
  status: StatusType;
  priority: PriorityType;
  dueDate?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateTaskDto {
  title: string;
  priority: PriorityType;
  userId: string;
}
