export async function generateRoomDesign(formData: FormData) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate design');
  }

  return response.json();
}
