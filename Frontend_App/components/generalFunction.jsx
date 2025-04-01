import { getToken,saveToken } from './storageComponent';
import {refreshAccessToken} from './refreshToken';

//index page

//validates the given login credentials (username and password) given by the user
export function validateLoginInfo(username, password) {
    let response = fetch("https://triple-j.onrender.com/api/account/token", {
      method: "POST",
      body: JSON.stringify({
        "username": username,
        "password": password,
      }),
      credentials: 'same-origin',
      headers: {
       "Content-Type": "application/json;",
      }
    });
    return response;
  }

 //fetches member's information
 export async function getMemberInfo() {
    try {
      let accessToken = await getToken("accessToken");
      let username = await getToken("username");
      

      let response = await fetch(`https://triple-j.onrender.com/api/account/member/${username}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
  
      if (response.status === 401) {
        console.log("Access token expired");
        accessToken = await refreshAccessToken();
        console.log("New access token: " + accessToken);
        if (!accessToken) {
          throw new Error("Failed to refresh access token");
        }
        
        response = await fetch(`https://triple-j.onrender.com/api/account/member/${username}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
      }
      return response;
      } catch (error) {
        console.error("Error:", error);
      }
  
  }
