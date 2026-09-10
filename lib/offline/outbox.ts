export interface OutboxItem {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  transactionDate: string;
  source: "manual" | "suara" | "nota";
  businessId?: string;
  createdAt: number;
  status: "pending" | "syncing" | "failed";
}

const STORAGE_KEY = "sikasir_offline_outbox";

export function getOutbox(): OutboxItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToOutbox(item: Omit<OutboxItem, "id" | "createdAt" | "status">): OutboxItem {
  const newItem: OutboxItem = {
    ...item,
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    status: "pending",
  };
  const current = getOutbox();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...current]));
  return newItem;
}

export function removeFromOutbox(id: string) {
  const current = getOutbox().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function updateOutboxItem(id: string, updates: Partial<Omit<OutboxItem, "id">>): void {
  const current = getOutbox().map((item) => (item.id === id ? { ...item, ...updates } : item));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export async function syncOutbox(
  saveRemote: (item: OutboxItem) => Promise<boolean>
): Promise<{ synced: number; failed: number }> {
  const items = getOutbox();
  if (items.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: OutboxItem[] = [];

  for (const item of items) {
    try {
      const ok = await saveRemote(item);
      if (ok) {
        synced++;
      } else {
        failed++;
        remaining.push(item);
      }
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  return { synced, failed };
}
