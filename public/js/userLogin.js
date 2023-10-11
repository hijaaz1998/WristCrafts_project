function validate(){
   


    const email = document.getElementById('email');
    const password = document.getElementById('password');


    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');


    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail+\.[a-zA-Z]{3}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


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

    //  Password Field

     if (password.value.trim() === '') {
        passwordError.innerHTML = 'Password is required'
        passwordError.style.color = 'red';
        setTimeout(() => {
           passwordError.innerHTML = ''
        }, 5000)
        return false;
     }
     if (!passwordRegex.test(password.value)) {
        passwordError.innerHTML = "Please enter a valid password"
        passwordError.style.color = 'red';
        setTimeout(() => {
           passwordError.innerHTML = ''
        }, 5000);
        return false;
     }

     return true;

}