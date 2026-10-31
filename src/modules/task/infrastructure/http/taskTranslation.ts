import type { Task } from '@/modules/task/domain/task'
import type { components } from '@/shared/api/client'

type TaskDto = components['schemas']['Task']

export const toTask = (dto: TaskDto): Task.Entity => ({
  id: String(dto.id),
  title: dto.title,
  done: dto.done,
})
