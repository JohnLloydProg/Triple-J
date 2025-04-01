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


//programs page


//get current timeline info
export async function getCurrentTimeline()  {
  try {
    let accessToken = await getToken("accessToken");
    let userId = await getToken("userId");
    parseInt(userId);

    const response = await fetch("https://triple-j.onrender.com/api/gym/progress/current", {
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
      
      response = await fetch("https://triple-j.onrender.com/api/gym/progress/current", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}


//get a list of available all avaialable workouts 
export async function getAvailableWorkouts()  {
  try {
    let accessToken = await getToken("accessToken");
    let refreshToken = await getToken("refreshToken");
    let userId = await getToken("userId");
    parseInt(userId);

    let response = await fetch("https://triple-j.onrender.com/api/gym/workouts", {
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
      
      response = await fetch("https://triple-j.onrender.com/api/gym/workouts", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}

//get the current user's programs and associated workouts
export async function getProgram() {
  try {
    let accessToken = await getToken("accessToken");
    let userId = await getToken("userId");
    parseInt(userId);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}`, {
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}


//add blank (no set day of the week) program
export async function addProgram() {
  try {
    let accessToken = await getToken("accessToken");
    let userId = await getToken("userId");
    parseInt(userId);
    

    let response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/create`, {
      method: "POST",
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}

//fucntion to delete a program
export async function deleteProgram(programId) {
  try {
    let accessToken = await getToken("accessToken");
    let userId = await getToken("userId");
    parseInt(userId);
    parseInt(programId);
  
    let response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/delete/${programId}`, {
      method: "DELETE",
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
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/delete/${programId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error from delete prog:", error);
    }
}

//function to update program with a specific day of the week
export async function updateProgram(programId,mainDate) {
  try {
    let accessToken = await getToken("accessToken");
    let userId = await getToken("userId");
    parseInt(userId);
    parseInt(programId);

    let response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/update/${programId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        'day':mainDate
      }),
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(`https://triple-j.onrender.com/api/gym/program/${userId}/update/${programId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          'day':mainDate
        }),
      });
    }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error: ", error);
    }
}