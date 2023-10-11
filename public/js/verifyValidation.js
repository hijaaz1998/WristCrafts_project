function verifyValidate(){


    const password = document.getElementById('password');
    const cpassword = document.getElementById('cpassword');
    const otp = document.getElementById('otp');

    const passwordValue = password.value;
    const cpasswordValue = cpassword.value;
    const otpValue = otp.value;

    const passwordError = document.getElementById('passwordError');
    const cpasswordError = document.getElementById('cpasswordError');
    const otpError = document.getElementById('otpError');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const otpRegex = /^[0-9]+$/



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

     if(passwordValue !== cpasswordValue){
        cpasswordError.innerHTML = 'Password Doesnt Match'
        cpasswordError.style.color = 'red';
        setTimeout(() => {
           passwordError.innerHTML = ''
        }, 5000)
        return false;
     }

     if(otpValue.trim() === '' ){
        otpError.innerHTML = "OTP is required"
        otpError.style.color = 'red';
        setTimeout(() => {
           otpError.innerHTML = ''
        }, 5000);
        return false;
     }

     if(!otpRegex.test(otpValue)){
        otpError.innerHTML = "OTP Must be a Number"
        otpError.style.color = 'red';
        setTimeout(() => {
           otpError.innerHTML = ''
        }, 5000);
        return false;
     }

   return true;

}