import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc as fsAddDoc, 
  query, 
  where, 
  limit, 
  getDocs 
} from "firebase/firestore"
import { db } from "./config"

export { db }

export async function getDocById<T>(col: string, id: string): Promise<T | null> {
  const ref = doc(db, col, id)
  const snap = await getDoc(ref)
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
}

export async function setDocData<T extends object>(col: string, id: string, data: T): Promise<void> {
  const ref = doc(db, col, id)
  await setDoc(ref, data)
}

export async function updateDocData(col: string, id: string, data: any): Promise<void> {
  const ref = doc(db, col, id)
  await updateDoc(ref, data)
}

export async function deleteDocData(col: string, id: string): Promise<void> {
  const ref = doc(db, col, id)
  await deleteDoc(ref)
}

export async function addDoc<T extends object>(col: string, data: T): Promise<string> {
  const collRef = collection(db, col)
  const docRef = await fsAddDoc(collRef, data)
  return docRef.id
}

export async function queryDocs<T>(col: string, field: string, op: any, value: any, limitNum = 50): Promise<T[]> {
  const collRef = collection(db, col)
  const q = query(collRef, where(field, op, value), limit(limitNum))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T))
}