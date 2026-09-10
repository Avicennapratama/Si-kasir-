import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./config"

export { storage }

export async function uploadFile(path: string, file: Blob | File): Promise<string> {
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  return await getDownloadURL(fileRef)
}

export async function deleteFile(path: string): Promise<void> {
  const fileRef = ref(storage, path)
  await deleteObject(fileRef)
}