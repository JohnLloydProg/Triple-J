let baseURL = "http://127.0.0.1:8000/";

fetch(baseURL + "api/account/authentication", {
    method : "POST",
    headers : {
        "Content-Type" : "application/json",
        "username" : "admin",
        "password" : "admin12345"
    },
    credentials: 'same-origin',
}).then((response) => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}).then((data) => {
    console.log(data);

    fetch(baseURL + "api/attendance/logging", {
        method : "GET",
        headers : {
            "Content-Type" : "application/json",
            "sessionId" : data["sessionId"],
        },
        credentials: 'same-origin',
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
    
        if (response.headers.get('Content-Type') == "application/json") {
            return response.json();
        }else {
            return response.blob();
        }
    }).then((data) => console.log(data)).catch((error) => console.error("Fetch error", error));
}).catch(
    (error) => console.error("Fetch error", error)
);
