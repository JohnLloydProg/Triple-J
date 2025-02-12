
let result

r = fetch("https://triple-j.onrender.com/api/account/authentication", {
    method : "POST",
    headers : {
        "Content-Type" : "application/json",
        "email" : "johnlloydunida0@gmail.com",
        "password" : "Unida12345"
    },
    credentials:'same-origin',
}).then((response) => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    return response.json();
}).then((data) => {
    console.log(data)
}).catch((error) => console.error("Fetch error", error));
