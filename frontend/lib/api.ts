const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function predictFrame(imageBlob: Blob) {
  const formData = new FormData();
  formData.append("file", imageBlob);

  const response = await fetch(`${API_URL}/model/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("YOLO prediction failed");
  return response.json();
}
