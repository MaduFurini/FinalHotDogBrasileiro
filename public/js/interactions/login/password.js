document.addEventListener('DOMContentLoaded', () => {
    const email = document.querySelector('input[name="email"]').value;

    if (!email) {
        Swal.fire({
            title: 'Email obrigatório',
            text: 'Por favor insira seu email para continuar',
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
                title: 'text-black libre-franklin',
                confirmButton: 'btn btn-second',
                text: 'libre-franklin'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/forgotPassword';
            }
        });
    }
});
