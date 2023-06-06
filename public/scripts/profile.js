const logout = document.getElementById('logout-button');
const username = document.getElementById('username');

username.innerHTML = `Username: ${localStorage.getItem('username')}`;

logout.addEventListener('click', (e) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will be redirected to authentication screen',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Yes, logout!',
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');

      window.location.href = 'auth.html';
    }
  });
});
