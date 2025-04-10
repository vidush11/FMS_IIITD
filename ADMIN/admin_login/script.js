const loginButton = document.getElementById('loginButton');

// function validateForm() {


//     const adminId = document.getElementById('adminId').value;
//     const password = document.getElementById('password').value;
//     const adminIdError = document.getElementById('adminIdError');
//     const passwordError = document.getElementById('passwordError');


//     adminIdError.style.display = 'none';
//     passwordError.style.display = 'none';

//     let isValid = false;





//     if (isValid) {

//         console.log('Form submitted:', { adminId, password });
//         window.location.href = '../admin_home/index.html';
//     }

//     return false;
// }

loginButton.addEventListener('click', (e) => {
    e.preventDefault(); // 👈 stop form from refreshing the page

    const adminId = document.getElementById('adminId').value;
    const password = document.getElementById('password').value;

    fetch('https://fmsbackend-iiitd.up.railway.app/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Admin_ID: adminId,
            AdminPassword: password
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log("Server response:", data);
            if (data.message === "Login successful") {
                window.location.href = '../admin_home/index.html';
            } else {
                alert(data.message || "Login failed");
            }
        })
        .catch(err => {
            console.error("Fetch error:", err);
            alert("Connection error. Please try again.");
        });
});
