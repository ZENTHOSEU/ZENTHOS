// Live Chat Implementation
class LiveChat {
    constructor() {
        this.chatWidget = document.getElementById('live-chat-widget');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-message');
        this.toggleButton = document.getElementById('toggle-chat');
        this.isMinimized = false;
        this.isConnected = false;
        this.setupEventListeners();
        this.connectToSupport();
    }

    setupEventListeners() {
        // Toggle chat window
        this.toggleButton.addEventListener('click', () => this.toggleChat());

        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isMinimized = !this.isMinimized;
        this.chatWidget.classList.toggle('minimized');
        this.toggleButton.innerHTML = this.isMinimized ? 
            '<i class="fas fa-plus"></i>' : 
            '<i class="fas fa-minus"></i>';
    }

    connectToSupport() {
        // Simulate connecting to support
        setTimeout(() => {
            this.isConnected = true;
            this.addMessage('System', 'Connected! How can we help you today?', 'system');
            this.addMessage('Support Agent', 'Hi! I\'m Alex from the ZENTHOS support team. How can I assist you?', 'support');
        }, 1500);
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (message && this.isConnected) {
            this.addMessage('You', message, 'user');
            this.chatInput.value = '';
            
            // Simulate support response
            this.simulateSupportResponse(message);
        }
    }

    addMessage(sender, message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            ${type !== 'user' ? `<strong>${sender}:</strong> ` : ''}
            ${message}
        `;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    simulateSupportResponse(userMessage) {
        // Simulate typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message support typing';
        typingDiv.innerHTML = '<strong>Support Agent:</strong> typing...';
        this.chatMessages.appendChild(typingDiv);

        // Simulate response delay
        setTimeout(() => {
            this.chatMessages.removeChild(typingDiv);
            
            // Generate simple response based on user message
            let response;
            const lowerMessage = userMessage.toLowerCase();
            
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                response = 'Hello! How can I help you today?';
            } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
                response = 'Our pricing varies depending on the project scope. Could you please provide more details about your requirements?';
            } else if (lowerMessage.includes('time') || lowerMessage.includes('long')) {
                response = 'Project timelines vary based on complexity. For a more accurate estimate, please fill out our detailed project request form.';
            } else {
                response = 'Thank you for your message. Could you please provide more details about your inquiry so I can better assist you?';
            }
            
            this.addMessage('Support Agent', response, 'support');
        }, 1500);
    }
}

// Initialize live chat when the page loads
window.addEventListener('load', () => {
    new LiveChat();
});
