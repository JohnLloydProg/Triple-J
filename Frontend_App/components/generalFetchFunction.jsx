import { getToken,saveToken } from './storageComponent';
import {refreshAccessToken} from './refreshToken';
import {Linking} from 'react-native';

const tripleJ_URL = "https://triple-j.onrender.com";

//index page

//validates the given login credentials (username and password) given by the user
export function validateLoginInfo(username, password) {
    let response = fetch(tripleJ_URL + "/api/account/token", {
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

  //checks if the user is a trainer or not it returns error
  //main function is to return list of members associated to a trainer
export async function checkIfTrainer() {
  try {
    let accessToken = await getToken("accessToken");

    let response = await fetch(tripleJ_URL + `/api/account/members`, {
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
      
      response = await fetch(tripleJ_URL + `/api/account/members`, {
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

 //fetches member's information
 export async function getMemberInfo() {
    try {
      let accessToken = await getToken("accessToken");
      let username = await getToken("username");
      

      let response = await fetch(tripleJ_URL + `/api/account/member/${username}`, {
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
        
        response = await fetch(tripleJ_URL + `/api/account/member/${username}`, {
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


//programs page


//get current timeline info
export async function getCurrentTimeline()  {
  try {
    let accessToken = await getToken("accessToken");
    let userId = await getToken("userId");
    parseInt(userId);

    const response = await fetch(tripleJ_URL + "/api/gym/progress/current", {
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
      
      response = await fetch(tripleJ_URL + "/api/gym/progress/current", {
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

    let response = await fetch(tripleJ_URL + "/api/gym/workouts", {
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
      
      response = await fetch(tripleJ_URL + "/api/gym/workouts", {
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
    let secondaryUserID = await getToken("secondaryUserID");
    parseInt(secondaryUserID);

    let useLink = "";
    let isTrainer = await getToken("isTrainer");
    if (isTrainer === "true") {
      useLink = `/api/gym/programs?user=${secondaryUserID}`
    }else{
      useLink = `/api/gym/programs`
    }


    let response = await fetch(tripleJ_URL + useLink, {
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
      
      response = await fetch(tripleJ_URL + useLink, {
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
    let secondaryUserID = await getToken("secondaryUserID");
    parseInt(secondaryUserID);

    let useLink = "";
    let isTrainer = await getToken("isTrainer");
    if (isTrainer === "true") {
      useLink = `/api/gym/programs?user=${secondaryUserID}`
    }else{
      useLink = `/api/gym/programs`
    }
    
    let response = await fetch(tripleJ_URL + useLink, {
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
      
      response = await fetch(tripleJ_URL + useLink, {
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
    let secondaryUserID = await getToken("secondaryUserID");
    parseInt(secondaryUserID);
    parseInt(programId);

    let useLink = "";
    let isTrainer = await getToken("isTrainer");
    if (isTrainer === "true") {
      useLink = `/api/gym/program/${programId}?user=${secondaryUserID}`
    }else{
      useLink = `/api/gym/program/${programId}`
    }
  
    let response = await fetch(tripleJ_URL + useLink, {
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
      
      response = await fetch(tripleJ_URL + useLink, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }
      //const data = response.json();
      //return data;
    } catch (error) {
      console.error("Error from delete prog:", error);
    }
}

//function to update program with a specific day of the week
export async function updateProgram(programId,mainDate) {
  try {
    let accessToken = await getToken("accessToken");
    let secondaryUserID = await getToken("secondaryUserID");
    parseInt(secondaryUserID);
    parseInt(programId);

    let useLink = "";
    let isTrainer = await getToken("isTrainer");
    if (isTrainer === "true") {
      useLink = `/api/gym/program/${programId}?user=${secondaryUserID}`
    }else{
      useLink = `/api/gym/program/${programId}`
    }

    console.log("Date Response", mainDate)

    let response = await fetch(tripleJ_URL + useLink , {
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
      
      response = await fetch(tripleJ_URL + useLink , {
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

//function to get all workouts associated with a program
export async function getWorkout(programId) {
  try {
    let accessToken = await getToken("accessToken");
    parseInt(programId);

    let response = await fetch(tripleJ_URL + `/api/gym/workout/${programId}`, {
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
      
      response = await fetch(tripleJ_URL + `/api/gym/workout/${programId}`, {
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

//function to add a workout
export async function addWorkout(programId, workoutType, mainDetails) {
  try {
    let accessToken = await getToken("accessToken");
    parseInt(programId);
    parseInt(workoutType);

    let response = await fetch(tripleJ_URL + `/api/gym/workout/${programId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },body: JSON.stringify({
        'workout': workoutType,
        'details': mainDetails
      
      })
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(tripleJ_URL + `/api/gym/workout/${programId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },body: JSON.stringify({
          'workout': workoutType,
          'details': mainDetails
        })
      });
    }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}

//function to delete a workout
export async function deleteWorkout(programId, workoutId) {
  try {
    let accessToken = await getToken("accessToken");
    parseInt(programId);
    parseInt(workoutId);


    let response = await fetch(tripleJ_URL + `/api/gym/workout/${programId}/delete/${workoutId}`, {
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
      
      response = await fetch(tripleJ_URL + `/api/gym/workout/${programId}/delete/${workoutId}`, {
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
      console.error("Error:", error);
    }
}

//gets all the records associated with a workout
export async function getRecord(programWorkout)  {
  try {
    let accessToken = await getToken("accessToken");
    let userId = await getToken("userId");
    parseInt(userId);

    let response = await fetch(tripleJ_URL + `/api/gym/workout-record/${programWorkout}`, {
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
      
      response = await fetch(tripleJ_URL + `/api/gym/workout-record/${programWorkout}`, {
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

//sets the record for a specific workout
export async function setRecord(programWorkout, mainDetails)  {
  try {
    let accessToken = await getToken("accessToken");
    let userId = await getToken("userId");
    parseInt(userId);

    let response = await fetch(tripleJ_URL + `/api/gym/workout-record/${programWorkout}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },body: JSON.stringify({
        'details': mainDetails
      })
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(tripleJ_URL + `/api/gym/workout-record/${programWorkout}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },body: JSON.stringify({
          'details': mainDetails
        })
      });
    }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
}


//settings page

//function to update height and weight of member
export async function setMemberHW(newHeight,newWeight) {
  try {
    let accessToken = await getToken("accessToken");
    let username = await getToken("username");
    let membershipType = await getToken("membershipType");
    
    let response = await fetch(tripleJ_URL + `/api/account/member/${username}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        'height':newHeight,
        'weight':newWeight,
        'username': username,
        'membershipType':membershipType,
      }),
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(tripleJ_URL + `/api/account/member/${username}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          'height':newHeight,
          'weight':newWeight,
          'username': username,
          'membershipType':membershipType,
        }),
      });
    }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
    }

}


export async function getMembershipInfo() {
  try {
    let accessToken = await getToken("accessToken");

    let response = await fetch(tripleJ_URL + "/api/account/membership", {
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
      
      response = await fetch(tripleJ_URL + "/api/account/membership", {
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


export async function startPayment() {
  try {
    let accessToken = await getToken("accessToken");

    let response = await fetch(tripleJ_URL + `/api/account/membership/subscription`, {
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
      
      response = await fetch(tripleJ_URL + `/api/account/membership/subscription`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      console.log(data.details.link);
      Linking.openURL(data.details.link).catch(err => console.error('An error occurred', err));
    } catch (error) {
      console.error("Error:", error);
    }

}

//home page 

import * as SecureStore from 'expo-secure-store';


const BASE_URL = 'https://triple-j.onrender.com/api';

/**
 * Helper function to make API requests with token refresh logic.
 * @param {string} endpoint - The API endpoint (e.g., /gym/program/current).
 * @param {string} method - HTTP method (GET, POST, etc.).
 * @param {object|null} body - Request body for POST/PUT requests.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws {Error} - Throws an error if the request fails or token refresh fails.
 */
async function request(endpoint, method = 'GET', body = null) {
  let accessToken = await SecureStore.getItemAsync('accessToken');
  const url = `${BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(url, options);

  if (response.status === 401) {
    try {
      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        console.error('Failed to refresh token: No new token received.');
        throw new Error('Session expired. Please log in again.');
      }
      await SecureStore.setItemAsync('accessToken', newAccessToken); 
      options.headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, options);
    } catch (refreshError) {
      console.error('Error refreshing access token:', refreshError);
     
      throw new Error('Session refresh failed. Please log in again.');
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = await response.text();
    }
    console.error(`API Error ${response.status} for ${method} ${endpoint}:`, errorData);
    throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchCurrentProgram(exerciseIconMap) {
  try {
    console.log("generalFetchFunction: Attempting to fetch current program...");
    const rawProgramData = await request('/gym/program/current', 'GET');
    
    console.log("Program Data: Raw program data received from API:", JSON.stringify(rawProgramData, null, 2));

    let exercisesArrayFromApi = [];

    if (rawProgramData && Array.isArray(rawProgramData.workouts)) {
        exercisesArrayFromApi = rawProgramData.workouts;
    } else {
        console.warn("generalFetchFunction: 'workouts' array not found or not an array in API response:", rawProgramData);
        return []; 
    }

    if (exercisesArrayFromApi.length === 0) {
      console.log("generalFetchFunction: Program data contains an empty 'workouts' array.");
      return []; 
    }
    
    const apiTypeToIconKey = {
        'U': 'upper',  // Example: Lateral Raise
        'C': 'core',   // Example: Sit-ups
        'L': 'lower',  // Example: Squats
        'PS': 'upper', // Example: Push-ups 
        
    };

    const processedExercises = exercisesArrayFromApi.map((exerciseApiObj, index) => {
      let exerciseName = '';
      let exerciseData = null; 

     
      for (const key in exerciseApiObj) {
        if (key !== 'type' && typeof exerciseApiObj[key] === 'object' && exerciseApiObj[key] !== null) {
          exerciseName = key;
          exerciseData = exerciseApiObj[key];
          break; 
        }
      }

      if (!exerciseName || !exerciseData) {
        console.warn(`generalFetchFunction: Could not parse exercise object at index ${index}:`, exerciseApiObj);
        return null; 
      }

      const apiType = exerciseApiObj.type;
      const iconMapKey = apiTypeToIconKey[apiType]; 
      
      let detailsString = `Sets: ${exerciseData.sets || 'N/A'}, Reps: ${exerciseData.reps || 'N/A'}`;

      if (exerciseData.weight && String(exerciseData.weight).trim() !== "" && String(exerciseData.weight).toLowerCase() !== "null") {
          detailsString += `, Weight: ${exerciseData.weight}`;
      }

      const generatedId = `${exerciseName.replace(/\s+/g, '_').toLowerCase()}-${index}`;

      return {
        id: generatedId, 
        name: exerciseName,
        details: detailsString,
        type: apiType, 
        icon: iconMapKey ? exerciseIconMap[iconMapKey] : null, 
        completed: false, 
      };
    }).filter(exercise => exercise !== null); 

    return processedExercises;

  } catch (error) {
    console.error("Error in fetchCurrentProgram (generalFetchFunction):", error.message, error);
    
    if (error.message && (error.message.toLowerCase().includes("not found") || error.message.includes("status 404"))) {
        console.log("generalFetchFunction: Received 404 or 'Not found', likely no program for today. Returning [].");
        return [];
    }
    throw error; 
  }
}

export async function fetchGymPopulation() {
  try {
    const data = await request('/attendance/logging', 'GET');
    return data; 
  } catch (error) {
    console.error("Error fetching gym population in apiService:", error);
    throw error;
  }
}

export async function fetchQrCode() {
  try {
    const data = await request('/attendance/qr-code', 'GET');
    
    console.log("Fetched QR Code Data from API:", data);
    return data;
  } catch (error) {
    console.error("Error fetching QR Code in apiService:", error);
    throw error;
  }
}

export async function generateNewQrCode() {
  try {
  
    const data = await request('/attendance/qr-code', 'POST');
   
    console.log("Generated New QR Code Data from API:", data);
    return data;
  } catch (error) {
    console.error("Error generating new QR Code in apiService:", error);
    throw error;
  }
}

// added by gascon
export const fetchLatestAnnouncement = async () => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${BASE_URL}/api/announcements/latest/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

 
  if (response.status === 404) {
    console.log("No latest announcement found.");
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch announcement. Status: ${response.status}`);
  }

  return await response.json();
};