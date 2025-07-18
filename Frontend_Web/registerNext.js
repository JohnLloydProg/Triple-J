const tripleJ_URL = "https://triple-j.onrender.com";


document.getElementById('contactNum').addEventListener('input', function (e) {
  this.value = this.value.replace(/[^0-9]/g, '');
});

document.getElementById('height').addEventListener('input', function () {

  this.value = this.value
    .replace(/[^0-9.]/g, '')      
    .replace(/^(\.)/, '0.')       
    .replace(/(\..*?)\..*/g, '$1'); 
});

document.getElementById('weight').addEventListener('input', function () {

  this.value = this.value
    .replace(/[^0-9.]/g, '')     
    .replace(/^(\.)/, '0.')     
    .replace(/(\..*?)\..*/g, '$1');
});

async function registerAccountCont(validationCode, firstName, lastName, birthDate, height, weight,mobileNumber,address,sex) {


    let response = await fetch(tripleJ_URL + `/api/account/registration-cont/${validationCode}`, {
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



    registerAccountCont(validationCode, firstName,lastName, dob, height, weight, contactNum, address, sex).then((data) => {
        console.log("DATA2: "+ data);
        console.log("Sucessfully registered account:");
        });

     


    console.log(username, email, password, firstName, lastName, membershipType, firstName,lastName,contactNum, sex, height, weight, address, dob);

   window.location.href = "accountRegistered.html" 

}