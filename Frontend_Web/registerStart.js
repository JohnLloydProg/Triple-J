

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
  


    window.location.href = "registerNext.html" 
   }else{
    alert("Incorred Credentials, please try again");
   }
}