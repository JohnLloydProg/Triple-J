import * as SecureStore from 'expo-secure-store';

export async function saveToken(key, value) {
  try{
  await SecureStore.setItemAsync(key,value);
  }catch(error){
    console.log(error);
  }
}

export async function getToken(key) {
  try{
    return await SecureStore.getItemAsync(key);
  }catch(error){
    console.log(error);
  }
} 