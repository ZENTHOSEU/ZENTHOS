class Dashboard {
    constructor() {
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        this.setupDashboard();
        this.loadCharts();
        this.setupEventListeners();
        this.loadRecentActivity();
    }

    setupDashboard() {
        // Set user information
        document.getElementById('staffName').textContent = this.currentUser.name;
        document.getElementById('staffNameHeader').textContent = this.currentUser.name;
        document.getElementById('staffRole').textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);

        // Show admin controls if user is admin
        if (this.currentUser.role === 'admin') {
            document.querySelector('.admin-only').style.display = 'block';
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchTab(e));
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });

        // Search functionality
        const searchInput = document.querySelector('.header-search input');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    switchTab(e) {
        e.preventDefault();
        const targetTab = e.currentTarget.dataset.tab;

        // Update active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        // Show selected tab content
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(targetTab)?.classList.add('active');
    }

    loadCharts() {
        // Project Status Chart
        const projectCtx = document.getElementById('projectChart')?.getContext('2d');
        if (projectCtx) {
            new Chart(projectCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress', 'Pending', 'On Hold'],
                    datasets: [{
                        data: [12, 8, 3, 1],
                        backgroundColor: [
                            '#10B981',
                            '#6366F1',
                            '#F59E0B',
                            '#EF4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Support Metrics Chart
        const supportCtx = document.getElementById('supportChart')?.getContext('2d');
        if (supportCtx) {
            new Chart(supportCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Tickets Resolved',
                        data: [8, 12, 15, 10, 14, 9, 7],
                        borderColor: '#6366F1',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    loadRecentActivity() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        const recentActivities = [
            {
                type: 'project',
                message: 'New project request submitted',
                time: '5 minutes ago'
            },
            {
                type: 'support',
                message: 'Support ticket #123 resolved',
                time: '1 hour ago'
            },
            {
                type: 'user',
                message: 'New user registration',
                time: '2 hours ago'
            }
        ];

        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span>${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            project: 'project-diagram',
            support: 'headset',
            user: 'user'
        };
        return icons[type] || 'info-circle';
    }

    handleSearch(query) {
        // Implement search functionality here
        console.log('Searching for:', query);
    }
}

// Initialize dashboard when the page loads
window.addEventListener('load', () => {
    new Dashboard();
});
