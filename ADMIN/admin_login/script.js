function validateForm(event) {
    event.preventDefault();

    const adminId = document.getElementById('adminId').value;
    const password = document.getElementById('password').value;
    const adminIdError = document.getElementById('adminIdError');
    const passwordError = document.getElementById('passwordError');


    adminIdError.style.display = 'none';
    passwordError.style.display = 'none';

    let isValid = true;


    if (adminId.trim().length < 3) {
        adminIdError.style.display = 'block';   //to validating admin id heree
        isValid = false;
    }


    if (password.length < 6) {
        passwordError.style.display = 'block';  //to validating pwd heree
        isValid = false;
    }

    if (isValid) {

        console.log('Form submitted:', { adminId, password });
        window.location.href = '../admin_home/index.html';
    }

    return false;
} 