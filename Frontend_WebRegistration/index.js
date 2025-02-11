
function continueRegister(){
    let username = document.querySelector("#username").value;
    let email= document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    let rePassword= document.querySelector("#rePassword").value;

    console.log(password);
    console.log(rePassword);
    
   if(username != "" && password != "" && email != "" && rePassword != "" && password === rePassword){
    window.location.href = "registerNext.html" 
   }else{
    alert("mali ka");
   }
}