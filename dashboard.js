// Check authentication and initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        
        if (!user.isAuthenticated || (user.role !== 'staff' && user.role !== 'owner')) {
            document.getElementById('unauthorizedMessage').style.display = 'flex';
            document.querySelector('.dashboard-container').style.display = 'none';
            return;
        }

        // Set user information
        const staffName = document.getElementById('staffName');
        const profileName = document.getElementById('profileName');
        if (staffName) staffName.textContent = user.name;
        if (profileName) profileName.textContent = user.name;

        // Initialize components with error handling
        initializeUI();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showError('Failed to initialize dashboard. Please try logging in again.');
    }
});

// Initialize UI components
function initializeUI() {
    try {
        // Show dashboard
        document.querySelector('.dashboard-body').classList.add('loaded');
        
        // Initialize animations
        initializeAnimations();
        
        // Initialize charts with delay to ensure DOM is ready
        setTimeout(initializeCharts, 100);
        
        // Initialize navigation
        initializeNavigation();
    } catch (error) {
        console.error('UI initialization error:', error);
        showError('Failed to initialize dashboard interface.');
    }
}

// Initialize GSAP animations
function initializeAnimations() {
    try {
        // Animate stats cards
        gsap.from('.stat-card', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Animate charts
        gsap.from('.chart-card', {
            duration: 0.8,
            scale: 0.9,
            opacity: 0,
            delay: 0.5,
            stagger: 0.2,
            ease: 'back.out(1.7)'
        });

        // Animate activity items
        gsap.from('.activity-item', {
            duration: 0.6,
            x: -50,
            opacity: 0,
            stagger: 0.1,
            delay: 1,
            ease: 'power2.out'
        });
    } catch (error) {
        console.error('Animation initialization error:', error);
    }
}

// Initialize Chart.js charts
function initializeCharts() {
    try {
        const projectCtx = document.getElementById('projectProgressChart');
        if (!projectCtx) {
            console.warn('Project progress chart canvas not found');
            return;
        }

        new Chart(projectCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Completed Projects',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#6200EA',
                    backgroundColor: 'rgba(98, 0, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        const taskCtx = document.getElementById('taskDistributionChart');
        if (!taskCtx) {
            console.warn('Task distribution chart canvas not found');
            return;
        }

        new Chart(taskCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#6200EA', '#03DAC6', '#B00020'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });
    } catch (error) {
        console.error('Chart initialization error:', error);
        showError('Failed to initialize dashboard charts.');
    }
}

// Initialize navigation
function initializeNavigation() {
    try {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                showSection(targetId);
            });
        });
    } catch (error) {
        console.error('Navigation initialization error:', error);
    }
}

// Show section with animation
function showSection(sectionId) {
    try {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Animate in
            gsap.from(targetSection, {
                duration: 0.5,
                opacity: 0,
                y: 20,
                ease: 'power2.out'
            });
        }
    } catch (error) {
        console.error('Section transition error:', error);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    try {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to log out. Please try again.');
    }
});
