// Secure hash function for passwords (in production, use bcrypt or similar)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// User database (in production, use a proper database)
const userDB = {
    users: [],
    staff: [
        {
            id: 'admin',
            email: 'mags_ignaex@protonmail.com',
            passwordHash: '7c8645c350c69937a127273c3825fc010615f0e918f1c332c3883a7f8f827061', // Pre-hashed password
            role: 'admin',
            name: 'Administrator',
            twoFactorEnabled: false,
            twoFactorSecret: null
        }
    ]
};

// Rate limiting for DDoS protection
const rateLimiter = {
    attempts: {},
    maxAttempts: 5,
    timeWindow: 300000, // 5 minutes
    
    isBlocked(ip) {
        const now = Date.now();
        const attempts = this.attempts[ip] || [];
        
        // Clean up old attempts
        this.attempts[ip] = attempts.filter(time => now - time < this.timeWindow);
        
        return this.attempts[ip].length >= this.maxAttempts;
    },
    
    recordAttempt(ip) {
        if (!this.attempts[ip]) {
            this.attempts[ip] = [];
        }
        this.attempts[ip].push(Date.now());
    }
};

// Authentication handler
class Auth {
    constructor() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.securityManager = new SecurityManager();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Check reCAPTCHA
                const captchaResponse = grecaptcha.getResponse();
                if (!captchaResponse) {
                    alert('Please complete the reCAPTCHA verification');
                    return;
                }
                
                // Check rate limiting
                const clientIP = await this.getClientIP();
                if (rateLimiter.isBlocked(clientIP)) {
                    alert('Too many login attempts. Please try again later.');
                    return;
                }
                
                this.handleLogin(e);
            });
        }

        // Google Sign-In
        const googleSignInBtn = document.getElementById('googleSignIn');
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', async () => {
                try {
                    const userData = await this.securityManager.googleAuth.signIn();
                    await this.handleGoogleSignIn(userData);
                } catch (error) {
                    console.error('Google Sign-In failed:', error);
                    alert('Google Sign-In failed. Please try again.');
                }
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // 2FA setup
        const setup2FABtn = document.getElementById('setup2FA');
        if (setup2FABtn) {
            setup2FABtn.addEventListener('click', () => this.setup2FA());
        }

        // Password visibility toggles
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e));
        });
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Failed to get client IP:', error);
            return 'unknown';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isStaff = document.querySelector('.auth-tab[data-tab="staff"]').classList.contains('active');

        try {
            const passwordHash = await hashPassword(password);
            const db = isStaff ? userDB.staff : userDB.users;
            const user = db.find(u => u.email === email && u.passwordHash === passwordHash);

            if (user) {
                // Check 2FA if enabled
                if (user.twoFactorEnabled) {
                    const token = prompt('Enter your 2FA code:');
                    if (!token || !(await this.securityManager.verify2FA(token))) {
                        throw new Error('Invalid 2FA code');
                    }
                }

                // Store session
                sessionStorage.setItem('currentUser', JSON.stringify({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    twoFactorEnabled: user.twoFactorEnabled
                }));

                // Redirect based on role
                if (isStaff) {
                    window.location.href = 'staff-dashboard.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            const clientIP = await this.getClientIP();
            rateLimiter.recordAttempt(clientIP);
            alert(error.message);
        }
    }

    async handleGoogleSignIn(userData) {
        // Check if user exists
        const existingUser = userDB.users.find(u => u.email === userData.email);
        
        if (existingUser) {
            sessionStorage.setItem('currentUser', JSON.stringify({
                id: existingUser.id,
                email: existingUser.email,
                role: existingUser.role,
                name: existingUser.name,
                twoFactorEnabled: existingUser.twoFactorEnabled
            }));
            window.location.href = 'user-dashboard.html';
        } else {
            // Create new user
            const newUser = {
                id: 'user_' + Date.now(),
                email: userData.email,
                name: userData.name,
                role: 'user',
                googleId: userData.id,
                twoFactorEnabled: false
            };
            userDB.users.push(newUser);
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            window.location.href = 'user-dashboard.html';
        }
    }

    async setup2FA() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return;

        const { secret, qrCode } = await this.securityManager.generateQRCode(currentUser.email);
        
        // Show QR code to user
        const modal = document.createElement('div');
        modal.className = 'two-factor-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Scan this QR code with your authenticator app</h3>
                <img src="${qrCode}" alt="2FA QR Code">
                <p>Secret key: ${secret}</p>
                <button onclick="this.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Update user's 2FA status
        const db = currentUser.role === 'staff' ? userDB.staff : userDB.users;
        const user = db.find(u => u.id === currentUser.id);
        if (user) {
            user.twoFactorEnabled = true;
            user.twoFactorSecret = secret;
        }
    }

    togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    switchAuthTab(e) {
        const selectedTab = e.currentTarget;
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        selectedTab.classList.add('active');
    }

    checkAuthStatus() {
        const currentUser = sessionStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('register.html')) {
                window.location.href = user.role === 'staff' ? 'staff-dashboard.html' : 'user-dashboard.html';
            }
        } else if (window.location.pathname.includes('dashboard')) {
            window.location.href = 'login.html';
        }
    }

    static logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            // Validation
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Check if email already exists
            if (userDB.users.some(u => u.email === email) || 
                userDB.staff.some(u => u.email === email)) {
                throw new Error('Email already registered');
            }

            const passwordHash = await hashPassword(password);
            const newUser = {
                id: 'user_' + Date.now(),
                email,
                passwordHash,
                role: 'user',
                name,
                twoFactorEnabled: false
            };

            userDB.users.push(newUser);
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } catch (error) {
            alert(error.message);
        }
    }
}

// Initialize authentication when the page loads
window.addEventListener('load', () => {
    new Auth();
});
