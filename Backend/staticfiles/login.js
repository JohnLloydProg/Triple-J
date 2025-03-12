baseURL = "https://triple-j.onrender.com/"

async function request(url, _method, _body=null, _headers={"Content-Type" : "application/json"}) {
    let responseData = null;
    if (_body == null) {
        responseData = await fetch(url, {
            method : _method,
            headers : _headers,
            credentials : "same-origin"
        }).then(response => {
            if (!response.ok) {
                throw new Error("Response was not ok!")
            }
            return response.json()
        })
    }else {
        responseData = await fetch(url, {
            method : _method,
            headers : _headers,
            body : _body,
            credentials : "same-origin"
        }).then(response => {
            if (!response.ok) {
                throw new Error("Response was not ok!")
            }
            return response.json()
        })
    }

    return responseData
}

async function login() {
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    try {
        response = await request(baseURL + "api/account/token", "POST", _body=JSON.stringify({"username":username, "password":password}))
        console.log(response)
        localStorage.setItem("refreshToken", response['refresh'])
        localStorage.setItem("accessToken", response['access'])
        window.location.replace(baseURL + "analytics")
    }catch(error) {
        alert("username or password does not match!")
    }
    
}