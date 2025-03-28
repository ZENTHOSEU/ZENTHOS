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
