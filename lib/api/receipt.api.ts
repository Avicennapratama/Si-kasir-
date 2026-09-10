export async function processReceiptImage(imageFile: File | Blob, businessId: string) {
  const formData = new FormData()
  formData.append("receipt", imageFile)
  formData.append("businessId", businessId)

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/receipt/process`
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  })
  return await res.json()
}