let baseURL = "https://triple-j.onrender.com/";

fetch(baseURL + "api/account/token", {
    method : "POST",
    headers : {
        "Content-Type" : "application/json"
    },
    body : JSON.stringify({
        'username':'its_lloyd',
        'password':'Unida12345'
    }),
    credentials: 'same-origin',
}).then((response) => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}).then((data) => {
    console.log(data);

    fetch(baseURL + "api/attendance/qr-code", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            "Authorization": `Bearer ${data['access']}`
        },
        credentials: 'same-origin'
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
    
        if (response.headers.get('Content-Type') == "application/json") {
            return response.json();
        }else {
            return response.blob();
        }
    }).then((data) => {
        console.log(data);    
    }).catch((error) => console.error("Fetch error", error));
}).catch(
    (error) => console.error("Fetch error", error)
);
