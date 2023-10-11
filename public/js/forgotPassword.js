function forgotValidate(){

    const email = document.getElementById('email');


    const emailError = document.getElementById('emailError');


    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail+\.[a-zA-Z]{3}$/;



     //  Email Validation

     if (email.value.trim() === '') {
        emailError.innerHTML = 'Email is required'
        emailError.style.color = 'red';
        setTimeout(() => {
           emailError.innerHTML = ''
        }, 5000)
        return false;
     }
     if (!emailRegex.test(email.value)) {
        emailError.innerHTML = "Please enter a valid email"
        emailError.style.color = 'red';
        setTimeout(() => {
           emailError.innerHTML = ''
        }, 5000);
        return false;
     }

   return true;

}