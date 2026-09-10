export interface EntityWithTimestamp {
  id: string
  updatedAt?: string | number | Date
}

export function resolveConflict<T extends EntityWithTimestamp>(local: T, remote: T): T {
  // Last-write-wins resolver logic
  const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0
  const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0

  return localTime > remoteTime ? local : remote
}