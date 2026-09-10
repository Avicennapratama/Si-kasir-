import { apiFetch } from "./client"

export interface AssistantAction {
  label: string
  type: "navigate" | "action" | "link"
  target: string
}

export interface AssistantChatResponse {
  reply: string
  suggestedActions?: AssistantAction[]
}

export interface AssistantHistoryItem {
  role: "user" | "assistant"
  content: string
}

/**
 * Backend: POST /assistant/chat  (functions/src/routes/assistant.routes.ts)
 * Wajib login — apiFetch otomatis melampirkan Firebase ID token.
 */
export async function sendAssistantMessage(
  businessId: string,
  message: string,
  history: AssistantHistoryItem[] = []
) {
  return await apiFetch<AssistantChatResponse>("/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ businessId, message, history }),
  })
}
