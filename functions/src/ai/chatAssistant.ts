/**
 * Assistant Chat AI integration — memakai Gemini sungguhan.
 */

import { GeminiClient } from './geminiClient.js';
import { assistantPrompt } from './prompts/assistant.prompt.js';

const client = new GeminiClient();

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantRequest {
  businessId: string;
  message: string;
  context?: any;
  history?: AssistantMessage[];
}

export interface AssistantResponse {
  reply: string;
  suggestedActions?: Array<{
    label: string;
    type: 'navigate' | 'action' | 'link';
    target: string;
  }>;
}

const DEFAULT_ACTIONS: AssistantResponse['suggestedActions'] = [
  { label: 'Lihat Laporan Bulan Ini', type: 'navigate', target: '/laporan' },
  { label: 'Catat Transaksi Baru', type: 'navigate', target: '/catat/manual' },
];

export const chatWithAssistant = async (
  request: AssistantRequest
): Promise<AssistantResponse> => {
  // Tanpa API key, kembalikan mock yang jelas bertanda agar tidak
  // tertukar dengan jawaban asli saat demo.
  if (!client.isConfigured) {
    console.warn('[assistant] GEMINI_API_KEY kosong — memakai balasan mock.');
    return {
      reply:
        `[MOCK — GEMINI_API_KEY belum diisi]\n\n` +
        `Pertanyaan Anda: "${request.message}"\n\n` +
        `Isi GEMINI_API_KEY di functions/.env untuk jawaban AI sungguhan.`,
      suggestedActions: DEFAULT_ACTIONS,
    };
  }

  // Sertakan maksimal 10 pesan terakhir supaya percakapan nyambung
  // tanpa membengkakkan token.
  const history = (request.history ?? [])
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'Pengguna' : 'Asisten'}: ${m.content}`)
    .join('\n');

  const contextBlock = request.context
    ? `\n\nKonteks usaha:\n${JSON.stringify(request.context)}`
    : '';

  const prompt = [
    assistantPrompt,
    contextBlock,
    history ? `\n\nRiwayat percakapan:\n${history}` : '',
    `\n\nPertanyaan pengguna sekarang:\n${request.message}`,
    `\n\nJawab langsung dalam Bahasa Indonesia. Jangan keluarkan JSON.`,
  ].join('');

  const reply = await client.generateText(prompt, 1500);

  return {
    reply: reply.trim(),
    suggestedActions: DEFAULT_ACTIONS,
  };
};
