let baseURL = "https://triple-j.onrender.com/";

fetch(baseURL + "api/account/registration/ee7bdef5-2982-46a9-99ef-12746d077cd9", {
    method : "POST",
    headers : {
        "Content-Type" : "application/json",
        "Authorization": `Bearer `
    },
    body : JSON.stringify({
        'email':'gmateo4002@gmail.com',
        'username':'its_mateo',
        'password':'Mateo12345',
        'membership':'Monthly'
    }),
    credentials: 'same-origin',
}).then((response) => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}).then((data) => {
    console.log(data);
}).catch(
    (error) => console.error("Fetch error", error)
);
