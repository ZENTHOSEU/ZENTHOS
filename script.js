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
