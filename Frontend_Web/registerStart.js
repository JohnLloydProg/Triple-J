const tripleJ_URL = "https://triple-j.onrender.com";


async function registerAccount(validationCode, email, username, password, membership) {

    let response = await fetch(tripleJ_URL + `/api/account/registration/${validationCode}`, {
        method: "POST",
        body: JSON.stringify({
            "email": email,
            "username": username,
            "password": password,
            "membership": membership
    }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    return data;
}

function continueRegister(){
    let username = document.querySelector("#username").value;
    let email= document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    let rePassword= document.querySelector("#rePassword").value;
    let membershipType = document.getElementById("frequency").value;



    
   if( membershipType && username != "" && password != "" && email != "" && rePassword != "" && password === rePassword){

    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    localStorage.setItem("membershipType", membershipType);

     const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const validationCode = urlParams.get('validationCode');
    console.log(validationCode);

    localStorage.setItem("validationCode", validationCode);

     registerAccount(validationCode, email, username, password, membershipType).then((data) => {
    console.log("DATA1: "+ data);
    console.log("Sucessfully registered account:");

        
    });
  


    window.location.href = "registerNext.html" 
   }else{
    alert("Incorred Credentials, please try again");
   }
}