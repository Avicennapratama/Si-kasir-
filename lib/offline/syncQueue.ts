import { idbGet, idbSet } from "./idb"

export interface QueueTask {
  id: string
  action: string
  payload: any
  retryCount: number
  createdAt: number
}

const QUEUE_STORE = "syncQueue"

export async function enqueueTask(task: Omit<QueueTask, "id" | "retryCount" | "createdAt">): Promise<string> {
  const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const newTask: QueueTask = {
    ...task,
    id,
    retryCount: 0,
    createdAt: Date.now(),
  }
  await idbSet(QUEUE_STORE, newTask)
  return id
}

export async function processQueue(handler: (task: QueueTask) => Promise<boolean>): Promise<void> {
  // Ponytail: Simple serial queue processing; expand with parallel worker when required.
}