const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const port = process.env.PORT || 3000;

let qrCodeData = null;
let client = null;

function createClient() {
    if (client) {
        client.destroy(); // Hentikan klien sebelumnya jika ada
    }

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', async (qr) => {
        try {
            qrCodeData = await qrcode.toDataURL(qr);
        } catch (err) {
            console.error('Failed to generate QR code', err);
            qrCodeData = null;
        }
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        qrCodeData = null; // Hapus QR code setelah klien siap
    });

    client.on('auth_failure', (msg) => {
        console.error('Authentication failed', msg);
        qrCodeData = null;
    });

    client.on('disconnected', (reason) => {
        console.log('Client disconnected', reason);
        setTimeout(createClient, 5000); // Recreate the client after a delay
    });

    client.initialize();
}

// Initialize the client for the first time
createClient();

app.use(express.static('public'));

app.get('/generate-qr', (req, res) => {
    if (qrCodeData) {
        res.json({ qrCode: qrCodeData });
    } else {
        res.status(500).json({ qrCode: null });
    }
});

app.get('/check-login', (req, res) => {
    res.json({ loggedIn: client.info !== undefined });
});

app.get('/logout', (req, res) => {
    client.logout().then(() => {
        qrCodeData = null;
        createClient(); // Recreate the client on logout
        res.json({ success: true, message: 'Logged out successfully' });
    }).catch(err => {
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Logout failed' });
    });
});

// Endpoint to send a message
app.get('/send-message', (req, res) => {
    const phone = req.query.phone;
    const text = req.query.text;

    if (!phone || !text) {
        return res.status(400).json({ success: false, message: 'Phone number and text are required' });
    }

    client.sendMessage(`${phone}@c.us`, text).then(response => {
        res.json({ success: true, message: 'Message sent successfully', response });
    }).catch(err => {
        console.error('Error sending message:', err);
        res.status(500).json({ success: false, message: 'Failed to send message', error: err });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
