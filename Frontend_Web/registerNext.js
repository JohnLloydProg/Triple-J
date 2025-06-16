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

async function registerAccountCont(validationCode, firstName, lastName, birthDate, height, weight,mobileNumber,address,sex) {


    let response = await fetch(tripleJ_URL + `/api/account/registration/${validationCode}`, {
        method: "POST",
        body: JSON.stringify({
            'first_name': firstName, 
            'last_name':lastName, 
            'birthDate':birthDate, 
            'height':height, 
            'weight':weight,
            'mobileNumber':mobileNumber, 
            'address':address, 
            'sex':sex
    }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    return data;
}


function completeForm(){
    //values from the previous form
    let username = localStorage.getItem("username");
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let membershipType = localStorage.getItem("membershipType")
    let validationCode = localStorage.getItem("validationCode");


    //values from the current form
    let firstName = document.querySelector("#firstName").value;
    let lastName = document.querySelector("#lastName").value;
    let contactNum = document.querySelector("#contactNum").value;
    let sex = document.querySelector("#sex").value;
    let dob = document.querySelector("#dob").value;
    let height = document.querySelector("#height").value;
    let weight = document.querySelector("#weight").value;
    let address = document.querySelector("#address").value;

    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);
    // const validationCode = urlParams.get('validationCode');
    // console.log(validationCode);

    registerAccount(validationCode, email, username, password, membershipType).then((data) => {
    console.log("DATA1: "+ data);
    console.log("Sucessfully registered account:");
    });

     registerAccountCont(validationCode, firstName,lastName, dob, height, weight, contactNum, address, sex).then((data) => {
    console.log("DATA2: "+ data);
    console.log("Sucessfully registered account:");
    });


    console.log(username, email, password, membershipType, firstName,lastName,contactNum, sex, height, weight, address, dob);

   // window.location.href = "accountRegistered.html" 

}