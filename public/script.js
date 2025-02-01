document.addEventListener('DOMContentLoaded', () => {
    const statusContainer = document.getElementById('status');
    const qrCodeContainer = document.getElementById('qr-code');
    const linkContainer = document.getElementById('link-container');
    const logoutButton = document.getElementById('logout-button');

    function loadQRCode() {
        fetch('/generate-qr')
            .then(response => response.json())
            .then(data => {
                if (data.qrCode) {
                    statusContainer.textContent = 'Silahkan login';
                    qrCodeContainer.innerHTML = `<img src="${data.qrCode}" alt="QR Code for WhatsApp Web Login"/>`;
                } else {
                    statusContainer.textContent = 'Loading QR Code. Please wait...';
                }
            })
            .catch(error => {
                statusContainer.textContent = 'Error loading QR code. Please try again.';
                console.error('Error:', error);
            });
    }

    function checkLoginStatus() {
        fetch('/check-login')
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    statusContainer.textContent = 'Terhubung';
                    qrCodeContainer.style.display = 'none';
                    linkContainer.style.display = 'block';
                } else {
                    statusContainer.textContent = 'Silahkan login';
                    qrCodeContainer.style.display = 'block';
                    linkContainer.style.display = 'none';
                    loadQRCode();
                }
            })
            .catch(error => {
                statusContainer.textContent = 'Error checking login status. Please try again.';
                console.error('Error:', error);
            });
    }

    function startPolling() {
        setInterval(checkLoginStatus, 3000); // Cek status login setiap 3 detik
    }

    logoutButton.addEventListener('click', () => {
        fetch('/logout')
            .then(() => {
                statusContainer.textContent = 'Berhasil logout';
                qrCodeContainer.style.display = 'block';
                qrCodeContainer.innerHTML = '';
                linkContainer.style.display = 'none';
                loadQRCode();
            })
            .catch(error => {
                statusContainer.textContent = 'Error logging out. Please try again.';
                console.error('Error:', error);
            });
    });

    loadQRCode();
    startPolling(); // Memulai polling status login
});
