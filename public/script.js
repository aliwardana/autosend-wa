document.addEventListener('DOMContentLoaded', () => {
    // Bagian login
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');
    const CORRECT_PASSWORD = "admin123";
  
    loginButton.addEventListener('click', () => {
      if (passwordInput.value === CORRECT_PASSWORD) {
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'flex';
      } else {
        loginError.style.display = 'block';
      }
    });
  
    // Bagian QR Code & Status
    const qrContainer = document.getElementById('qr-container');
    const statusText = document.getElementById('status-text');
    const logoutButton = document.getElementById('logout-button');
  
    // Jika belum login ke WhatsApp, tampilkan QR Code
    function loadQRCode() {
      // Pastikan di dalam qr-container terdapat elemen <img> untuk QR Code
      if (!document.getElementById('qr-image')) {
        qrContainer.innerHTML = '<img id="qr-image" src="" alt="QR Code WhatsApp">';
      }
      const qrImage = document.getElementById('qr-image');
      fetch('/generate-qr')
        .then(response => response.json())
        .then(data => {
          if (data.qrCode) {
            qrImage.src = data.qrCode;
          } else {
            qrImage.src = "";
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  
    // Cek status login WhatsApp secara periodik
    function checkLoginStatus() {
      fetch('/check-login')
        .then(response => response.json())
        .then(data => {
          if (data.loggedIn) {
            // Ganti tampilan QR Code dengan centang hijau
            qrContainer.innerHTML = '<div class="checkmark">✔</div>';
            // Update kotak status menjadi hijau dengan teks "Terhubung"
            statusText.textContent = "Terhubung";
            logoutButton.style.display = 'block';
          } else {
            // Jika belum login, pastikan kembali elemen <img> ada di dalam qr-container
            if (!document.getElementById('qr-image')) {
              qrContainer.innerHTML = '<img id="qr-image" src="" alt="QR Code WhatsApp">';
            }
            statusText.textContent = "Menunggu login...";
            logoutButton.style.display = 'none';
            loadQRCode();
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  
    logoutButton.addEventListener('click', () => {
      fetch('/logout')
        .then(() => {
          location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  
    loadQRCode();
    setInterval(checkLoginStatus, 3000);
  });
  