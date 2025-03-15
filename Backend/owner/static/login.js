

async function login() {
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    try {
        response = await myRequest.post("api/account/token", JSON.stringify({"username":username, "password":password}))
        console.log(response)
        localStorage.setItem("refreshToken", response['refresh'])
        localStorage.setItem("accessToken", response['access'])
        window.location.replace(myRequest.baseURL + "analytics")
    }catch(error) {
        alert("username or password does not match!")
    }
    
}