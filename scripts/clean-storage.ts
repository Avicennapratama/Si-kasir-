import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function cleanStorage() {
  console.log('Cleaning storage temp/voice files...');
  const listRef = ref(storage, 'audio-temp');
  try {
    const res = await listAll(listRef);
    for (const itemRef of res.items) {
      await deleteObject(itemRef);
    }
    console.log('Clean storage completed.');
  } catch (error) {
    console.error('Error cleaning storage:', error);
  }
}

cleanStorage().catch(console.error);