import { axiosPublic } from './axios-config';

export async function testBackendEndpoint(): Promise<string> {
  try {
    const response = await axiosPublic.get<string>('/test');
    return response.data;
  } catch (error) {
    console.error("Error calling test endpoint:", error);
    throw error;
  }
}
