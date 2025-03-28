document.getElementById('project-request-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        projectType: document.getElementById('project-type').value,
        programmingLanguage: document.getElementById('programming-language').value,
        timeline: document.getElementById('timeline').value,
        budget: document.getElementById('budget').value,
        projectDescription: document.getElementById('project-description').value
    };

    // You would typically send this data to your server
    console.log('Project Request:', formData);
    
    // Show success message
    alert('Thank you for submitting your project request! Our team will review the details and get back to you within 24 hours.\n\nFor immediate assistance, please use our live chat support or email us at mags_ignaex@protonmail.com');
    
    // Reset form
    this.reset();
});
