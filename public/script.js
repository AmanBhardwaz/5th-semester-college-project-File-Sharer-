// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.padding = '0.5rem 0';
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
    } else {
        navbar.style.padding = '1rem 0';
        navbar.style.background = 'rgba(15, 23, 42, 0.9)';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Button hover effects
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Feature card animations
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Form interactions (simulated)
document.querySelector('.btn-primary').addEventListener('click', function() {
    alert('Thank you for your interest! Sign up functionality would be implemented here.');
});

document.querySelector('.btn-secondary').addEventListener('click', function() {
    alert('Google sign-in integration would be implemented here.');
});

document.querySelector('.btn-secondary-outline').addEventListener('click', function() {
    alert('Password login form would appear here.');
});

document.querySelector('.btn-login').addEventListener('click', function() {
    alert('Login form would appear here.');
});

document.querySelector('.btn-signup').addEventListener('click', function() {
    alert('Sign up form would appear here.');
});

// Network animation enhancement
function enhanceNetworkAnimation() {
    const lines = document.querySelectorAll('.connection-line');
    lines.forEach((line, index) => {
        // Randomize animation delays for a more dynamic effect
        line.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add random pulsing to nodes
    const nodes = document.querySelectorAll('.node:not(.node-center)');
    nodes.forEach(node => {
        setInterval(() => {
            const scale = 1 + Math.random() * 0.3;
            node.style.transform = `scale(${scale})`;
        }, 2000 + Math.random() * 3000);
    });
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    enhanceNetworkAnimation();
    
    // Add subtle background animation
    document.body.style.background = 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)';
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'gradientShift 15s ease infinite';
    
    // Add CSS for background animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
    document.head.appendChild(style);
});