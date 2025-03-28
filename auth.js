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
            email: 'spoonfullofjamie@gmail.com',
            role: 'owner',
            name: 'Owner',
            twoFactorEnabled: false,
            twoFactorSecret: null,
            isGoogleAuth: true
        },
        {
            id: 'staff',
            email: 'mags_ignaex@protonmail.com',
            passwordHash: '7c8645c350c69937a127273c3825fc010615f0e918f1c332c3883a7f8f827061',
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

// Google Sign-In handler
function handleGoogleSignIn(response) {
    const credential = response.credential;
    const profile = jwt_decode(credential);
    
    // Handle the signed-in user info
    if (profile) {
        const email = profile.email;
        const name = profile.name;
        
        // Check if it's the owner's email
        const isOwner = email === 'spoonfullofjamie@gmail.com';
        
        if (isOwner) {
            // Set up owner session
            sessionStorage.setItem('user', JSON.stringify({
                email,
                name,
                role: 'owner',
                isAuthenticated: true
            }));
            
            // Redirect to admin dashboard or show owner controls
            document.body.classList.add('owner-logged-in');
            console.log('Owner logged in successfully');
            
            // Show success message
            alert('Welcome back, Owner!');
            
            // Close the login modal if it's open
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.remove('active');
            }
        } else {
            // Regular user login
            sessionStorage.setItem('user', JSON.stringify({
                email,
                name,
                role: 'user',
                isAuthenticated: true
            }));
            console.log('User logged in with Google:', email);
        }
    } else {
        console.error('Failed to get user profile from Google Sign-In');
        alert('Login failed. Please try again.');
    }
}

// Handle Google Sign-In errors
function handleGoogleSignInError(error) {
    console.error('Google Sign-In failed:', error);
    alert('Google Sign-In failed. Please try again.');
}

// Check if user is owner
function isOwner() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    return user.email === 'spoonfullofjamie@gmail.com' && user.isAuthenticated;
}

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
                
                // Get form data
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const isStaff = document.querySelector('.auth-tab.active').dataset.tab === 'staff';
                
                try {
                    // Check rate limiting
                    const userIP = 'test-ip'; // In production, get real IP
                    if (rateLimiter.isBlocked(userIP)) {
                        throw new Error('Too many login attempts. Please try again later.');
                    }

                    // Verify reCAPTCHA
                    const recaptchaResponse = grecaptcha.getResponse();
                    if (!recaptchaResponse) {
                        throw new Error('Please complete the reCAPTCHA verification');
                    }

                    // Hash password
                    const passwordHash = await hashPassword(password);
                    
                    // Check credentials
                    const db = isStaff ? userDB.staff : userDB.users;
                    const user = db.find(u => u.email === email && (u.isGoogleAuth || u.passwordHash === passwordHash));
                    
                    if (!user) {
                        throw new Error('Invalid email or password');
                    }
                    
                    // Set up session
                    sessionStorage.setItem('user', JSON.stringify({
                        email: user.email,
                        role: user.role,
                        name: user.name,
                        isAuthenticated: true
                    }));

                    // Update UI based on role
                    if (user.role === 'owner') {
                        document.body.classList.add('owner-logged-in');
                    }

                    // Close login modal
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) {
                        loginModal.classList.remove('active');
                    }

                    console.log('Login successful');
                } catch (error) {
                    console.error('Login failed:', error);
                    alert(error.message);
                    rateLimiter.recordAttempt(userIP);
                }
            });
        }

        // Google Sign-In
        const googleSignInBtn = document.getElementById('googleSignIn');
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', async () => {
                try {
                    const userData = await this.securityManager.googleAuth.signIn();
                    await handleGoogleSignIn(userData);
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

    async handleGoogleSignIn(userData) {
        // Check if user exists
        const existingUser = userDB.users.find(u => u.email === userData.email);
        
        if (existingUser) {
            sessionStorage.setItem('user', JSON.stringify({
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
            sessionStorage.setItem('user', JSON.stringify(newUser));
            window.location.href = 'user-dashboard.html';
        }
    }

    async setup2FA() {
        const currentUser = JSON.parse(sessionStorage.getItem('user'));
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
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const currentPath = window.location.pathname;
        
        // If on dashboard, check authorization
        if (currentPath.includes('staff-dashboard.html')) {
            if (!user.isAuthenticated || (user.role !== 'staff' && user.role !== 'owner')) {
                window.location.href = 'index.html';
                return;
            }
        }

        // Update UI based on role
        if (user.isAuthenticated) {
            if (user.role === 'owner') {
                document.body.classList.add('owner-logged-in');
            } else if (user.role === 'staff') {
                document.body.classList.add('staff-logged-in');
            }
        }
    }

    static logout() {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
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
