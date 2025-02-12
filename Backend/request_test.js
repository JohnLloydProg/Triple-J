
let result

r = fetch("https://triple-j.onrender.com/api/account/authentication", {
    method : "POST",
    headers : {
        "Content-Type" : "application/json",
        "email" : "gclm4002@gmail.com",
        "password" : "gian12345"
    },
    credentials: 'same-origin',
}).then((response) => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    return response.json();
}).then((data) => {
    console.log(data)
    fetch("https://triple-j.onrender.com/api/attendance/qr-code", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            "sessionId" : data["sessionId"],
        },
        credentials: 'same-origin',
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return response.blob();
    }).then((data) => console.log(data));
}).catch((error) => console.error("Fetch error", error));
