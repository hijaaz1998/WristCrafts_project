function registerValidate(){

    const fname = document.getElementById('fname');
    const lname = document.getElementById('lname');
    const mobile = document.getElementById('mobile');
    const email = document.getElementById('email');
    const password = document.getElementById('password');


    const fnameError = document.getElementById('fnameError');
    const lnameError = document.getElementById('lnameError');
    const mobileError = document.getElementById('mobileError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');


    const fnameRegex = /^[A-Z]/;
    const lnameRegex = /^[A-Z]/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail+\.[a-zA-Z]{3}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const mobileRegex = /^[0-9]{10}$/;


    // First Name Vlidation

    if (fname.value.trim() === '') {
        fnameError.innerHTML = 'First Name is required'
        fnameError.style.color = 'red';
        setTimeout(() => {
           fnameError.innerHTML = ''
        }, 5000)
        return false;
     }
     if(!fnameRegex.test(fname.value)){
        fnameError.innerHTML = 'First letter should be capital'
        fnameError.style.color = 'red';
        setTimeout(()=>{
           fnameError.innerHTML = ''
        },5000)
        return false;
     }

    //  Last Name Vlidation

     if (lname.value.trim() === '') {
        lnameError.innerHTML = 'Last Name is required'
        lnameError.style.color = 'red';
        setTimeout(() => {
           lnameError.innerHTML = ''
        }, 5000)
        return false;
     }
     if(!lnameRegex.test(lname.value)){
        lnameError.innerHTML = 'First letter should be capital'
        lnameError.style.color = 'red';
        setTimeout(()=>{
           lnameError.innerHTML = ''
        },5000)
        return false;
     }

     // Mobile Validation

      if (mobile.value.trim() === '') {
         mobileError.innerHTML = 'Mobile is required'
         mobileError.style.color = 'red';
         setTimeout(() => {
            mobileError.innerHTML = ''
         }, 5000)
         return false;
      }
   
      if(!mobileRegex.test(mobile.value)){
         mobileError.innerHTML = 'Please enter a valid number'
         mobileError.style.color = 'red';
         setTimeout(()=>{
            mobileError.innerHTML = ''
         },5000)
         return false;
      }

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
        passwordError.innerHTML = "Please enter a strong password"
        passwordError.style.color = 'red';
        setTimeout(() => {
           passwordError.innerHTML = ''
        }, 5000);
        return false;
     }

   return true;

}