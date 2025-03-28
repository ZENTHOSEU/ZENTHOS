// Check authentication
document.addEventListener('DOMContentLoaded', () => {
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

    // Initialize animations
    initializeAnimations();
    
    // Initialize charts
    initializeCharts();
    
    // Show dashboard
    document.querySelector('.dashboard-body').classList.add('loaded');
});

// Initialize GSAP animations
function initializeAnimations() {
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
}

// Initialize Chart.js charts
function initializeCharts() {
    // Project Progress Chart
    const projectCtx = document.getElementById('projectProgressChart').getContext('2d');
    new Chart(projectCtx, {
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

    // Task Distribution Chart
    const taskCtx = document.getElementById('taskDistributionChart').getContext('2d');
    new Chart(taskCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Pending', 'Delayed'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: [
                    '#00C853',
                    '#6200EA',
                    '#03DAC6',
                    '#CF6679'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            cutout: '70%'
        }
    });
}

// Navigation handling
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all items
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
        });
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Animate section change (to be implemented based on sections)
        const targetSection = item.getAttribute('href').substring(1);
        showSection(targetSection);
    });
});

// Show section with animation
function showSection(sectionId) {
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        if (section.id === sectionId) {
            gsap.to(section, {
                duration: 0.5,
                opacity: 1,
                x: 0,
                display: 'block',
                ease: 'power2.out'
            });
        } else {
            gsap.to(section, {
                duration: 0.5,
                opacity: 0,
                x: 50,
                display: 'none',
                ease: 'power2.in'
            });
        }
    });
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('dashboardAuth');
    window.location.href = 'index.html';
});

// Search functionality
const searchInput = document.querySelector('.header-search input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    // Implement search functionality here
    // This is a placeholder for the search feature
    console.log('Searching for:', searchTerm);
});

// Add smooth hover effect to cards
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = -(x - centerX) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'none';
    });
});
