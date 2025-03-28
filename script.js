// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Get Started button functionality
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    const contactForm = document.getElementById('contact-form');
    
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add highlight animation
    contactForm.classList.add('highlight-form');
    
    // Remove highlight after animation
    setTimeout(() => {
        contactForm.classList.remove('highlight-form');
    }, 2000);
}

// Form submission handling
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Add your form submission logic here
    alert('Thank you for your message! Our support team will get back to you soon.\nFor direct contact, please email: mags_ignaex@protonmail.com');
    this.reset();
});

// Add animation on scroll
window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        if (cardTop < window.innerHeight - 100) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});

// Chat support functionality
class ChatSupport {
    constructor() {
        this.responses = {
            greeting: [
                "Hello! How can I help you today?",
                "Welcome to ZENTHOS! What can I assist you with?",
                "Hi there! How may I help you?"
            ],
            general: [
                "I understand. Could you provide more details about your issue?",
                "Let me check that for you.",
                "Have you tried updating your code or clearing your cache?",
                "I can help you with that. What specific programming language are you using?",
                "That's a common issue. Here's what you can try...",
                "Would you like me to connect you with one of our developers?",
                "I'll make a note of that and have our team look into it.",
                "Is there anything else you'd like to know?",
                "Thank you for your patience. I'm working on finding a solution.",
                "I see. Have you encountered this issue before?",
                "Let me guide you through the troubleshooting steps.",
                "Could you share your code snippet so I can better assist you?",
                "I'll help you resolve this as quickly as possible."
            ]
        };
        this.lastResponseIndex = -1;
        this.hasGreeted = false;
        this.setupChat();
    }

    setupChat() {
        const chatButton = document.createElement('button');
        chatButton.className = 'chat-button';
        chatButton.innerHTML = '<i class="fas fa-comments"></i>';
        document.body.appendChild(chatButton);

        const chatWidget = document.createElement('div');
        chatWidget.className = 'chat-widget';
        chatWidget.style.display = 'none';
        chatWidget.innerHTML = `
            <div class="chat-header">
                <h3>ZENTHOS Support</h3>
                <button class="close-chat">&times;</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <input type="text" placeholder="Type your message...">
                <button class="send-message"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;
        document.body.appendChild(chatWidget);

        // Event listeners
        chatButton.addEventListener('click', () => {
            chatWidget.style.display = 'flex';
            chatButton.style.display = 'none';
            if (!this.hasGreeted) {
                this.addMessage(this.getRandomResponse('greeting'), 'support');
                this.hasGreeted = true;
            }
        });

        chatWidget.querySelector('.close-chat').addEventListener('click', () => {
            chatWidget.style.display = 'none';
            chatButton.style.display = 'block';
            // Reset greeting flag when chat is closed
            this.hasGreeted = false;
            // Clear chat messages
            chatWidget.querySelector('.chat-messages').innerHTML = '';
        });

        const sendButton = chatWidget.querySelector('.send-message');
        const input = chatWidget.querySelector('input');

        const sendMessage = () => {
            const message = input.value.trim();
            if (message) {
                this.addMessage(message, 'user');
                input.value = '';
                setTimeout(() => this.respondToUser(), 1000);
            }
        };

        sendButton.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    addMessage(text, sender) {
        const messages = document.querySelector('.chat-messages');
        const message = document.createElement('div');
        message.className = `chat-message ${sender}`;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    getRandomResponse(type = 'general') {
        const responses = this.responses[type];
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * responses.length);
        } while (newIndex === this.lastResponseIndex && responses.length > 1);
        
        this.lastResponseIndex = newIndex;
        return responses[newIndex];
    }

    respondToUser() {
        const response = this.getRandomResponse('general');
        this.addMessage(response, 'support');
    }
}

// Initialize chat support
const chatSupport = new ChatSupport();

// Authentication handling
function handleCredentialResponse(response) {
    try {
        const responsePayload = jwt_decode(response.credential);
        console.log("Email:", responsePayload.email);
        
        // Check if it's an owner or staff email
        if (responsePayload.email === 'spoonfullofjamie@gmail.com' || 
            responsePayload.email === 'zybe.bouguernine@kouterkortrijk.com') {
            handleLogin(responsePayload, 'owner');
        } else if (responsePayload.email === 'mags_ignaex@protonmail.com') {
            handleLogin(responsePayload, 'staff');
        } else {
            handleLogin(responsePayload, 'user');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showError('Authentication failed. Please try again.');
    }
}

function handleLogin(payload, role) {
    try {
        // Store user info
        const userData = {
            email: payload.email,
            name: payload.name,
            role: role,
            isAuthenticated: true
        };
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect based on role
        if (role === 'owner' || role === 'staff') {
            window.location.href = 'staff-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Failed to log in. Please try again.');
    }
}

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

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        
        // If on dashboard page
        if (window.location.pathname.includes('staff-dashboard.html')) {
            if (!user.isAuthenticated || (user.role !== 'staff' && user.role !== 'owner')) {
                // Show unauthorized message
                const unauthorizedMessage = document.getElementById('unauthorizedMessage');
                if (unauthorizedMessage) {
                    unauthorizedMessage.style.display = 'flex';
                }
                document.querySelector('.dashboard-container').style.display = 'none';
            } else {
                // Show dashboard
                document.querySelector('.dashboard-container').style.display = 'flex';
                document.querySelector('.dashboard-body').classList.add('loaded');
            }
        }
        
        // Update UI elements
        const staffNameElements = document.querySelectorAll('#staffName');
        staffNameElements.forEach(el => {
            if (el) el.textContent = user.name || 'Guest';
        });
    } catch (error) {
        console.error('Authentication check error:', error);
        showError('Failed to verify authentication. Please try logging in again.');
    }
});

// Modern notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <p>${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    gsap.fromTo(notification,
        {
            x: 50,
            opacity: 0
        },
        {
            duration: 0.5,
            x: 0,
            opacity: 1,
            ease: 'power2.out'
        }
    );
    
    setTimeout(() => {
        gsap.to(notification, {
            duration: 0.5,
            x: 50,
            opacity: 0,
            ease: 'power2.in',
            onComplete: () => notification.remove()
        });
    }, 3000);
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    // Hero section animations
    gsap.from('.hero-content h1', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-content p', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 0.3,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-buttons', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 0.6,
        ease: 'power3.out'
    });

    // Services section animations
    const serviceCards = gsap.utils.toArray('.service-card');
    serviceCards.forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            },
            duration: 0.8,
            y: 50,
            opacity: 0,
            delay: i * 0.2,
            ease: 'power2.out'
        });
    });
});

// Modal handling
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');

loginBtn?.addEventListener('click', () => {
    loginModal.classList.add('active');
    gsap.from('.modal-content', {
        duration: 0.5,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)'
    });
});

closeModal?.addEventListener('click', () => {
    gsap.to('.modal-content', {
        duration: 0.5,
        scale: 0.8,
        opacity: 0,
        ease: 'power2.in',
        onComplete: () => {
            loginModal.classList.remove('active');
            gsap.set('.modal-content', { clearProps: 'all' });
        }
    });
});

// Live chat widget
const chatWidget = document.getElementById('live-chat-widget');
const toggleChat = document.getElementById('toggle-chat');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessage = document.getElementById('sendMessage');

let isChatOpen = true;

toggleChat?.addEventListener('click', () => {
    const chatBody = chatWidget.querySelector('.chat-body');
    const icon = toggleChat.querySelector('i');
    
    if (isChatOpen) {
        gsap.to(chatBody, {
            duration: 0.5,
            height: 0,
            opacity: 0,
            ease: 'power2.inOut'
        });
        icon.className = 'fas fa-plus';
    } else {
        gsap.to(chatBody, {
            duration: 0.5,
            height: 'auto',
            opacity: 1,
            ease: 'power2.inOut'
        });
        icon.className = 'fas fa-minus';
    }
    
    isChatOpen = !isChatOpen;
});

// Send chat message
function sendChatMessage(message, isUser = true) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${isUser ? 'user' : 'support'}`;
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    gsap.from(messageElement, {
        duration: 0.5,
        y: 20,
        opacity: 0,
        ease: 'power2.out'
    });
}

// Handle message input
messageInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            sendChatMessage(message);
            messageInput.value = '';
            
            // Simulate support response
            setTimeout(() => {
                sendChatMessage('Thank you for your message. A support agent will respond shortly.', false);
            }, 1000);
        }
    }
});

sendMessage?.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        sendChatMessage(message);
        messageInput.value = '';
        
        // Simulate support response
        setTimeout(() => {
            sendChatMessage('Thank you for your message. A support agent will respond shortly.', false);
        }, 1000);
    }
});

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('loginButton');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');

    // Open modal
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        loginModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close modal when clicking outside
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

    // Prevent modal close when clicking inside the auth-box
    const authBox = document.querySelector('.auth-box');
    authBox.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
});

// Responsive navigation
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    if (navLinks.classList.contains('active')) {
        gsap.from('.nav-links a', {
            duration: 0.5,
            opacity: 0,
            y: 20,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
});
