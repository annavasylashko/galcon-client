const loginCheck = () => {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning!',
            text: 'Some fields are empty'
        })
    } else {
        axios.post('http://localhost:8000/api/tokens', { username, password })
            .then(function(response) {
                const token = response.data.token;

                localStorage.setItem('token', token);
                localStorage.setItem('username', username);

                window.location.href = "index.html";
            })
            .catch((error) => {
                if (error.response) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: error.response.data.message
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: error.message
                    });
                }
            });
    }
}

const createNewUser = () => {
    const username = document.getElementById("newRegUsername").value;
    const password = document.getElementById("newRegPassword").value;
    const rePassword = document.getElementById("repeatedPassword").value;

    if (!username || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning!',
            text: 'Some fields are empty'
        });
    } else if (password !== rePassword) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning!',
            text: 'The passwords are not the same'
        });
    } else {
        axios.post('http://localhost:8000/api/users', { username, password })
            .then((response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Registration is successful. Sign in to the system.'
                });
                showLoginForm()
            })
            .catch((error) => {
                if (error.response) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: error.response.data.message
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: error.message
                    });
                }
            });
    }
};

function showRegistrationForm() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registrationForm").classList.remove("hidden");


    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";
}

function showLoginForm() {
    document.getElementById("registrationForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");

    // Очистити поля вводу форми реєстрації
    document.getElementById("newRegUsername").value = "";
    document.getElementById("newRegPassword").value = "";
    document.getElementById("repeatedPassword").value = "";
}

document.getElementById("loginFormElement").addEventListener("submit", function(event) {
    event.preventDefault();
    loginCheck()

    document.getElementById("loginUserMail").value = "";
    document.getElementById("loginPassword").value = "";
});

document.getElementById("registrationFormElement").addEventListener("submit", function(event) {
    event.preventDefault();
    createNewUser()

    document.getElementById("newRegUsername").value = "";
    document.getElementById("newRegPassword").value = "";
    document.getElementById("repeatedPassword").value = "";
});
