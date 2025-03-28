// Security configurations and handlers
class SecurityManager {
    constructor() {
        this.recaptchaConfig = {
            siteKey: '6LdkTgIrAAAAADoXsKLDqAAT_efR6kzf2pTiV0LP',
            secretKey: '6LdkTgIrAAAAAPd9fHDg-9oLmCQMWk7r767ZjIzS'
        };
        this.setupReCaptcha();
        this.setup2FA();
        this.setupOAuth();
    }

    // reCAPTCHA setup and verification
    setupReCaptcha() {
        // Add callback to window object
        window.recaptchaCallback = this.verifyCallback.bind(this);
        window.onloadCallback = function() {
            grecaptcha.render('recaptcha', {
                'sitekey': this.recaptchaConfig.siteKey,
                'callback': 'recaptchaCallback'
            });
        }.bind(this);
    }

    async verifyCallback(token) {
        try {
            // In production, this verification should happen on your server
            const response = await fetch('/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('reCAPTCHA verification failed:', error);
            return false;
        }
    }

    // Get reCAPTCHA response
    getRecaptchaResponse() {
        return grecaptcha.getResponse();
    }

    // Reset reCAPTCHA
    resetRecaptcha() {
        grecaptcha.reset();
    }

    // 2FA Implementation
    setup2FA() {
        const setup2FABtn = document.getElementById('setup2FA');
        if (setup2FABtn) {
            setup2FABtn.addEventListener('click', () => this.initiate2FASetup());
        }
    }

    async initiate2FASetup() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please log in first');
            return;
        }

        try {
            // Generate secret using speakeasy
            const secret = speakeasy.generateSecret({
                name: `ZENTHOS (${currentUser.email})`,
                length: 20
            });

            // Generate QR code using qrcode
            const otpauthUrl = secret.otpauth_url;
            const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

            // Show QR code modal
            this.show2FAModal(qrCodeUrl, secret.base32);

            // Save secret temporarily
            sessionStorage.setItem('temp2FASecret', secret.base32);
        } catch (error) {
            console.error('2FA setup failed:', error);
            alert('Failed to set up 2FA. Please try again.');
        }
    }

    show2FAModal(qrCode, secret) {
        const modal = document.createElement('div');
        modal.className = 'two-factor-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Set up Two-Factor Authentication</h3>
                <p>1. Install Google Authenticator on your phone</p>
                <p>2. Scan this QR code with the app:</p>
                <img src="${qrCode}" alt="2FA QR Code">
                <p>Or manually enter this code: <code>${secret}</code></p>
                <p>3. Enter the 6-digit code from the app:</p>
                <input type="text" id="verify2FACode" maxlength="6" placeholder="Enter code">
                <div class="modal-buttons">
                    <button onclick="securityManager.verify2FASetup()" class="btn btn-primary">Verify</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async verify2FASetup() {
        const code = document.getElementById('verify2FACode').value;
        const secret = sessionStorage.getItem('temp2FASecret');
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

        if (!code || !secret || !currentUser) {
            alert('Invalid verification attempt');
            return;
        }

        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: code
        });

        if (verified) {
            // Update user's 2FA status
            currentUser.twoFactorEnabled = true;
            currentUser.twoFactorSecret = secret;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update in userDB
            const db = currentUser.role === 'staff' ? userDB.staff : userDB.users;
            const user = db.find(u => u.id === currentUser.id);
            if (user) {
                user.twoFactorEnabled = true;
                user.twoFactorSecret = secret;
            }

            // Clean up and notify
            sessionStorage.removeItem('temp2FASecret');
            alert('2FA has been successfully enabled!');
            document.querySelector('.two-factor-modal').remove();
        } else {
            alert('Invalid code. Please try again.');
        }
    }

    verify2FALogin(code, secret) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: code,
            window: 1 // Allows for 30 seconds time skew
        });
    }

    // OAuth setup for Google Sign-In
    setupOAuth() {
        this.googleAuth = new GoogleAuth();
    }

    async verify2FA(token) {
        return await this.twoFactorAuth.verify(token);
    }

    async generateQRCode(userId) {
        return await this.twoFactorAuth.generateQR(userId);
    }
}

// Two-Factor Authentication Handler
class TwoFactorAuth {
    constructor() {
        this.secretKey = crypto.randomBytes(32);
    }

    async generateQR(userId) {
        const secret = this.generateSecret();
        const otpauth = `otpauth://totp/ZENTHOS:${userId}?secret=${secret}&issuer=ZENTHOS`;
        return { secret, qrCode: await this.generateQRCode(otpauth) };
    }

    async verify(token) {
        // Verify TOTP token
        return this.verifyTOTP(token, this.secretKey);
    }

    generateSecret() {
        return base32.encode(crypto.randomBytes(16));
    }

    verifyTOTP(token, secret) {
        const window = 1; // Allow 30 seconds window
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: window
        });
    }
}

// Google OAuth Handler
class GoogleAuth {
    constructor() {
        this.clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your actual client ID
        this.loadGoogleAPI();
    }

    loadGoogleAPI() {
        gapi.load('auth2', () => {
            gapi.auth2.init({
                client_id: this.clientId
            });
        });
    }

    async signIn() {
        try {
            const googleUser = await gapi.auth2.getAuthInstance().signIn();
            const profile = googleUser.getBasicProfile();
            return {
                id: profile.getId(),
                email: profile.getEmail(),
                name: profile.getName(),
                imageUrl: profile.getImageUrl()
            };
        } catch (error) {
            console.error('Error during Google Sign-In:', error);
            throw error;
        }
    }
}

// Initialize security manager
const securityManager = new SecurityManager();
