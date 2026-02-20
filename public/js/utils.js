/* ============================================
   BETHEL COLLEGE JS UTILITIES
   Enhanced interactivity and visual feedback
   ============================================ */

// Toast Notification System
class ToastNotification {
    constructor() {
        this.container = null;
        this.createContainer();
    }

    createContainer() {
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    show(options) {
        const {
            title = '',
            message = '',
            type = 'info', // success, error, warning, info
            duration = 5000,
            icon = null
        } = options;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast-custom toast-${type}`;
        toast.innerHTML = `
            <i class="toast-icon ${icon || icons[type]}"></i>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toast);
            }, duration);
        }

        return toast;
    }

    dismiss(toast) {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    success(message, title = 'Success') {
        return this.show({ title, message, type: 'success' });
    }

    error(message, title = 'Error') {
        return this.show({ title, message, type: 'error' });
    }

    warning(message, title = 'Warning') {
        return this.show({ title, message, type: 'warning' });
    }

    info(message, title = 'Info') {
        return this.show({ title, message, type: 'info' });
    }
}

// Create global toast instance
window.toast = new ToastNotification();

// Loading Overlay System
class LoadingOverlay {
    constructor() {
        this.overlay = null;
    }

    show(text = 'Loading...') {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'loading-overlay';
            this.overlay.innerHTML = `
                <div class="loading-spinner-custom large"></div>
                <div class="loading-text">${text}</div>
            `;
            document.body.appendChild(this.overlay);
        } else {
            this.overlay.querySelector('.loading-text').textContent = text;
            this.overlay.style.display = 'flex';
        }
        document.body.style.overflow = 'hidden';
    }

    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    updateText(text) {
        if (this.overlay) {
            this.overlay.querySelector('.loading-text').textContent = text;
        }
    }
}

// Create global loading instance
window.loading = new LoadingOverlay();

// Scroll Animation Observer
class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all elements with animation classes
        document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .stagger-children').forEach(el => {
            this.observer.observe(el);
        });
    }

    observe(element) {
        this.observer.observe(element);
    }

    unobserve(element) {
        this.observer.unobserve(element);
    }
}

// Initialize scroll animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.scrollAnimations = new ScrollAnimations();
});

// Button Loading State
class ButtonLoader {
    static setLoading(button, loadingText = 'Loading...') {
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.disabled = true;
        button.innerHTML = `
            <span class="loading-spinner-custom"></span>
            ${loadingText}
        `;
    }

    static resetLoading(button) {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            button.disabled = false;
            delete button.dataset.originalText;
        }
    }

    static showSpinner(button) {
        const spinner = button.querySelector('.loading-spinner-custom');
        if (spinner) spinner.style.display = 'inline-block';
    }

    static hideSpinner(button) {
        const spinner = button.querySelector('.loading-spinner-custom');
        if (spinner) spinner.style.display = 'none';
    }
}

window.ButtonLoader = ButtonLoader;

// Form Validation Helpers
class FormValidator {
    static showError(input, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        let feedback = input.parentElement.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback-custom';
            input.parentElement.appendChild(feedback);
        }
        feedback.textContent = message;
        feedback.style.display = 'block';
    }

    static showSuccess(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) feedback.style.display = 'none';
    }

    static clearValidation(input) {
        input.classList.remove('is-invalid', 'is-valid');
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) feedback.style.display = 'none';
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]{10,}$/;
        return re.test(phone);
    }
}

window.FormValidator = FormValidator;

// Smooth Scroll Helper
function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }
}

window.smoothScrollTo = smoothScrollTo;

// Debounce Helper
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.debounce = debounce;

// Throttle Helper
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.throttle = throttle;

// Navbar Scroll Effect
function initNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            navbar.style.padding = '10px 0';
        } else {
            navbar.style.boxShadow = '';
            navbar.style.padding = '';
        }
    }, 100);

    window.addEventListener('scroll', handleScroll);
}

// Initialize navbar scroll effect
document.addEventListener('DOMContentLoaded', initNavbarScrollEffect);

// Back to Top Button
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    `;
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(backToTopBtn);

    const handleScroll = throttle(() => {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    }, 100);

    window.addEventListener('scroll', handleScroll);
}

document.addEventListener('DOMContentLoaded', initBackToTop);

// Character Counter for Textareas
function initCharacterCounters() {
    document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        const counter = document.createElement('small');
        counter.className = 'text-muted char-counter';
        counter.style.cssText = 'display: block; text-align: right; margin-top: 5px;';
        
        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `Characters remaining: ${remaining}`;
            if (remaining < 50) {
                counter.style.color = '#f56565';
            } else if (remaining < 100) {
                counter.style.color = '#ecc94b';
            } else {
                counter.style.color = '';
            }
        };
        
        textarea.parentNode.insertBefore(counter, textarea.nextSibling);
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });
}

document.addEventListener('DOMContentLoaded', initCharacterCounters);

// Enhanced Form Submission with Loading & Toast
async function submitFormWithFeedback(form, options = {}) {
    const {
        buttonSelector = 'button[type="submit"]',
        loadingText = 'Processing...',
        successTitle = 'Success',
        successMessage = 'Your request was processed successfully!',
        errorTitle = 'Error',
        redirectUrl = null,
        redirectDelay = 1500
    } = options;

    const button = form.querySelector(buttonSelector);
    const originalText = button.innerHTML;
    
    try {
        // Show loading state
        button.disabled = true;
        button.innerHTML = `<span class="loading-spinner-custom"></span>${loadingText}`;
        
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: form.method || 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Show success toast
            toast.success(successMessage, successTitle);
            
            // Reset form if successful
            form.reset();
            
            // Redirect if needed
            if (redirectUrl) {
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, redirectDelay);
            }
            
            return { success: true, data };
        } else {
            // Show error toast
            toast.error(data.message || 'An error occurred', errorTitle);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error('Form submission error:', error);
        toast.error('Network error. Please check your connection.', 'Connection Error');
        return { success: false, error };
    } finally {
        // Reset button
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

window.submitFormWithFeedback = submitFormWithFeedback;

// Export utilities for use in other scripts
window.BethelUtils = {
    toast: window.toast,
    loading: window.loading,
    scrollAnimations: window.scrollAnimations,
    ButtonLoader,
    FormValidator,
    smoothScrollTo,
    debounce,
    throttle,
    submitFormWithFeedback
};
