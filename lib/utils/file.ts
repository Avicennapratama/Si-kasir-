export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1).toLowerCase()
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/")
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith("audio/")
}

export function fileSizeMb(file: File): number {
  return file.size / (1024 * 1024)
}

export function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName)
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`
}