const tripleJ_URL = "https://triple-j.onrender.com";
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexUsername= /^[a-zA-Z0-9]+$/;


async function checkmem() {
  try {
    let response = await fetch(tripleJ_URL + `/api/account/membership-types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    const select = document.getElementById('membershipType');

    select.length = 1;

    data.forEach(type => {
      const option = document.createElement('option');
      option.value = type.id;         
      option.textContent = type.name; 
      option.style.color = 'black';
      select.appendChild(option);
    });

  } catch (error) {
    console.error("Error fetching membership types:", error);
  }
}


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
    return { status: response.status, data }; 
}

function continueRegister(){
    let username = document.querySelector("#username").value;
    let email= document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    let rePassword= document.querySelector("#rePassword").value;
    let membershipType = document.getElementById("membershipType").value;

    const isChecked = document.getElementById('agreeCheckbox').checked;

    console.log(membershipType);


    
   if( (membershipType== 1 || membershipType== 2)  && username != "" && password != "" && email != "" && rePassword != "" && password === rePassword && isChecked){

    try{

    console.log("Email Format Check: " + regexEmail.test(email));
     if (!regexEmail.test(email)) {
    throw new Error("Invalid email format.");
    }

    console.log("Username Format Check: " + regexUsername.test(username));
     if (!regexUsername.test(username)) {
    throw new Error("Invalid username format.");
    }


    
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    localStorage.setItem("membershipType", membershipType);

     const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const validationCode = urlParams.get('validationCode');
    console.log(validationCode);

    localStorage.setItem("validationCode", validationCode);

     registerAccount(validationCode, email, username, password, membershipType).then((result) => {
      if (result.status === 409) {
        console.error('Conflict error: Username already exists or there is a conflict.');
        alert('Username or email already exists. Please try a different one.');
        return; 
      }

      console.log("DATA1: ", result.data);
      console.log("Successfully registered account:");

      window.location.href = "registerNext.html";
    });

  }catch(err){
    console.log(err)
    alert(`Incorrect Credentials, ${err}`);
  }
   }else{
    alert("Incorrect Credentials, please try again");
   }
}