function completeForm(){
    //values from the previous form
    let username = localStorage.getItem("username");
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");


    //values from the current form
    let firstName = document.querySelector("#firstName").value;
    let lastName = document.querySelector("#lastName").value;
    let contactNum = document.querySelector("#contactNum").value;


    console.log(username, email, password,firstName,lastName,contactNum);

    //window.location.href = "accountRegistered.html" 

}