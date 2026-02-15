/**
 * Task model helpers.
 */

export type TaskStatus = 'TODO' | 'DOING' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type TaskDoc = {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  completedAt: Date | null

  assigneeId: string
  departmentId: string | null

  createdBy: string
  createdAt: Date
  updatedAt: Date

  isArchived: boolean
}
