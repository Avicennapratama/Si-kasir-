let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

export async function startRecording(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder = new MediaRecorder(stream)
  audioChunks = []

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data)
  }

  mediaRecorder.start()
}

export function stopRecording(): Promise<Blob> {
  return new Promise((resolve) => {
    if (!mediaRecorder) {
      resolve(new Blob([], { type: "audio/webm" }))
      return
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" })
      resolve(blob)
    }
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach((t) => t.stop())
  })
}

export function isRecording(): boolean {
  return mediaRecorder?.state === "recording"
}