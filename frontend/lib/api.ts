export interface Item {
  name: string;
  link: string;
  category?: string;
  price?: number;
}

export interface DesignResult {
  original_url: string;
  generated_url: string;
  items: Item[];
  thread_id?: string;
}

const API_BASE_URL = 'http://localhost:8000';

export async function generateRoomDesign(
  formData: FormData
): Promise<DesignResult> {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate design');
  }

  return response.json();
}

// Response from session init
interface InitSessionResult {
  thread_id: string;
  original_url: string;
}

export async function initSession(file: File): Promise<InitSessionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/init-session`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to initialize session');
  }

  return response.json();
}

export async function getSessionHistory(
  threadId: string
): Promise<DesignResult> {
  const response = await fetch(`${API_BASE_URL}/session/${threadId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to retrieve session');
  }

  return response.json();
}
