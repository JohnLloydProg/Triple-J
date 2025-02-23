function completeForm(){
    //values from the previous form
    let username = localStorage.getItem("username");
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    let membershipType = localStorage.getItem("membershipType")


    //values from the current form
    let firstName = document.querySelector("#firstName").value;
    let lastName = document.querySelector("#lastName").value;
    let contactNum = document.querySelector("#contactNum").value;
    let sex = document.querySelector("#sex").value;
    let dob = document.querySelector("#dob").value;
    let height = document.querySelector("#height").value;
    let weight = document.querySelector("#weight").value;
    let address = document.querySelector("#address").value;


    console.log(username, email, password, membershipType, firstName,lastName,contactNum, sex, height, weight, address, dob);

    //window.location.href = "accountRegistered.html" 

}