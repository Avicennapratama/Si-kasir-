export interface AssistantChat {
  id: string
  businessId: string
  title: string
  topic: string
  messages: Array<{
    role: "user" | "assistant" | "system"
    content: string
    timestamp: string | number | Date
  }>
  createdAt: string | number | Date
}