document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    
    // Get saved theme from localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    themeToggle.checked = currentTheme === 'dark';
    themeLabel.textContent = currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';

    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
    });

    // Settings Navigation
    const settingsNavItems = document.querySelectorAll('.settings-nav-item');
    const settingsSections = document.querySelectorAll('.settings-section');

    settingsNavItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items and sections
            settingsNavItems.forEach(i => i.classList.remove('active'));
            settingsSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked item and corresponding section
            item.classList.add('active');
            const sectionId = item.dataset.section;
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Accent Color Selection
    const colorOptions = document.querySelectorAll('.color-option');
    const root = document.documentElement;

    // Get saved accent color from localStorage
    const savedAccentColor = localStorage.getItem('accentColor') || '#6200EA';
    root.style.setProperty('--primary-color', savedAccentColor);
    colorOptions.forEach(option => {
        if (option.dataset.color === savedAccentColor) {
            option.classList.add('active');
        }
    });

    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            const color = option.dataset.color;
            root.style.setProperty('--primary-color', color);
            localStorage.setItem('accentColor', color);
        });
    });

    // Form Submissions
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const displayName = document.getElementById('displayName').value;
        const email = document.getElementById('email').value;
        
        // Here you would typically send this data to your backend
        console.log('Updating profile:', { displayName, email });
        showNotification('Profile updated successfully!');
    });

    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match!', 'error');
            return;
        }

        // Here you would typically send this data to your backend
        console.log('Updating password');
        showNotification('Password updated successfully!');
    });

    // Notification System
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        gsap.fromTo(notification, 
            { y: -100, opacity: 0 }, 
            { y: 20, opacity: 1, duration: 0.5 }
        );

        // Remove after 3 seconds
        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                y: -100,
                duration: 0.5,
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    // Check Authentication
    function checkAuth() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
            window.location.href = 'index.html';
        }

        // Show staff dashboard link if user is staff
        const staffLink = document.querySelector('.staff-only');
        if (user && (user.role === 'staff' || user.role === 'owner')) {
            staffLink.style.display = 'block';
        }

        // Populate user data
        if (user) {
            document.getElementById('displayName').value = user.name || '';
            document.getElementById('email').value = user.email || '';
        }
    }

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Initialize
    checkAuth();
});
