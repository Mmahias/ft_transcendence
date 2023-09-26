import { api } from './config-api';

export async function testBackendEndpoint(): Promise<string> {
  try {
    const response = await api.get<string>('/test');
    return response.data;
  } catch (error) {
    console.error("Error calling test endpoint:", error);
    throw error;
  }
}
