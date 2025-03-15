import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://triple-j.onrender.com/api/account/token/refresh';

export async function refreshAccessToken() {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    await SecureStore.setItemAsync('accessToken', data.access);
    const updatedAccessToken = await SecureStore.getItemAsync('accessToken');
    return updatedAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);

    if (error instanceof ReferenceError && error.message.includes("refreshAccessToken")) {
      router.push('/');
    }
    
    return null;
  }
}