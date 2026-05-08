// ===== CONFIGURATION =====
const CONFIG = {
    apiBaseUrl: 'https://api.example.com', // Replace with your actual API
    storageKey: 'zack_delivery_data',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    toastDuration: 4000,
    animations: {
        fadeIn: 'fadeIn 0.3s ease',
        slideDown: 'slideDown 0.3s ease'
    }
};

// ===== DOM ELEMENTS =====
const elements = {
    // Navigation
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    mobileMenu: document.getElementById('mobile-menu'),
    navLinks: document.querySelector('.nav-links'),
    
    // Modals
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    closeButtons: document.querySelectorAll('.close'),
    switchToRegister: document.getElementById('switchToRegister'),
    switchToLogin: document.getElementById('switchToLogin'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    registerName: document.getElementById('registerName'),
    registerEmail: document.getElementById('registerEmail'),
    registerPhone: document.getElementById('registerPhone'),
    registerPassword: document.getElementById('registerPassword'),
    registerConfirmPassword: document.getElementById('registerConfirmPassword'),
    
    // Error elements
    loginEmailError: document.getElementById('loginEmailError'),
    loginPasswordError: document.getElementById('loginPasswordError'),
    registerNameError: document.getElementById('registerNameError'),
    registerEmailError: document.getElementById('registerEmailError'),
    registerPhoneError: document.getElementById('registerPhoneError'),
    registerPasswordError: document.getElementById('registerPasswordError'),
    registerConfirmPasswordError: document.getElementById('registerConfirmPasswordError')
};

// ===== UTILITY FUNCTIONS =====
class Utils {
    // Format phone number
    static formatPhoneNumber(phone) {
        return phone.replace(/\D/g, '');
    }

    // Generate random ID
    static generateId(prefix = '') {
        return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Debounce function
    static debounce(func, wait) {
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

    // Validate email format
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate password strength
    static validatePassword(password) {
        return password.length >= 6;
    }

    // Validate phone number
    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{9,14}$/;
        return re.test(phone.replace(/\D/g, ''));
    }

    // Show loading state
    static showLoading(element) {
        if (!element) return;
        const originalHTML = element.innerHTML;
        element.dataset.originalHTML = originalHTML;
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        element.disabled = true;
        element.classList.add('loading');
    }

    // Hide loading state
    static hideLoading(element) {
        if (!element) return;
        element.innerHTML = element.dataset.originalHTML || '';
        element.disabled = false;
        element.classList.remove('loading');
    }

    // Get element by ID safely
    static getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id "${id}" not found`);
        }
        return element;
    }
}

// ===== TOAST NOTIFICATION SYSTEM =====
class Toast {
    static show(message, type = 'success', duration = CONFIG.toastDuration) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const title = type === 'success' ? 'Success!' : 'Error!';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// ===== FORM VALIDATION =====
class FormValidator {
    static showError(element, message) {
        if (!element) return;
        element.textContent = message;
        element.style.color = '#E74C3C';
    }

    static showSuccess(element, message = '✓') {
        if (!element) return;
        element.textContent = message;
        element.style.color = '#2ECC71';
    }

    static clearError(element) {
        if (!element) return;
        element.textContent = '';
    }

    static clearAllErrors() {
        const errorElements = document.querySelectorAll('.error');
        errorElements.forEach(error => {
            error.textContent = '';
            error.style.color = '';
        });
    }

    static validateLoginForm(email, password) {
        let isValid = true;

        if (!email || !Utils.validateEmail(email)) {
            FormValidator.showError(elements.loginEmailError, 'Please enter a valid email');
            isValid = false;
        }

        if (!password || !Utils.validatePassword(password)) {
            FormValidator.showError(elements.loginPasswordError, 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    static validateRegisterForm(formData) {
        let isValid = true;

        // Validate name
        if (!formData.name || formData.name.trim().length < 2) {
            FormValidator.showError(elements.registerNameError, 'Name must be at least 2 characters');
            isValid = false;
        }

        // Validate email
        if (!formData.email || !Utils.validateEmail(formData.email)) {
            FormValidator.showError(elements.registerEmailError, 'Please enter a valid email');
            isValid = false;
        }

        // Validate phone
        if (!formData.phone || !Utils.validatePhone(formData.phone)) {
            FormValidator.showError(elements.registerPhoneError, 'Please enter a valid phone number');
            isValid = false;
        }

        // Validate password
        if (!formData.password || !Utils.validatePassword(formData.password)) {
            FormValidator.showError(elements.registerPasswordError, 'Password must be at least 6 characters');
            isValid = false;
        }

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
            FormValidator.showError(elements.registerConfirmPasswordError, 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }
}

// ===== MODAL MANAGEMENT =====
class ModalManager {
    static currentModal = null;

    static openModal(modal) {
        if (!modal) return;
        
        this.currentModal = modal;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Trigger animation
        setTimeout(() => {
            modal.style.animation = CONFIG.animations.fadeIn;
        }, 10);
    }

    static closeModal(modal) {
        if (!modal) return;
        
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        
        // Clear forms
        if (modal === elements.loginModal && elements.loginForm) {
            elements.loginForm.reset();
        }
        if (modal === elements.registerModal && elements.registerForm) {
            elements.registerForm.reset();
        }
        
        FormValidator.clearAllErrors();
    }

    static closeAllModals() {
        [elements.loginModal, elements.registerModal].forEach(modal => {
            if (modal) {
                this.closeModal(modal);
            }
        });
    }

    static initModalEvents() {
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (this.currentModal && e.target === this.currentModal) {
                this.closeModal(this.currentModal);
            }
        });

        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal(this.currentModal);
            }
        });
    }
}

// ===== AUTHENTICATION MANAGER =====
class AuthManager {
    static currentUser = null;
    static sessionTimeout = null;

    static init() {
        this.loadSession();
        this.setupSessionTimeout();
    }

    static loadSession() {
        try {
            const userData = localStorage.getItem(`${CONFIG.storageKey}_user`);
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.updateAuthUI();
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.clearSession();
        }
    }

    static saveSession(userData) {
        try {
            this.currentUser = userData;
            localStorage.setItem(`${CONFIG.storageKey}_user`, JSON.stringify(userData));
            this.updateAuthUI();
            this.resetSessionTimeout();
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    static clearSession() {
        this.currentUser = null;
        localStorage.removeItem(`${CONFIG.storageKey}_user`);
        this.updateAuthUI();
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
    }

    static updateAuthUI() {
        if (!elements.loginBtn) return;

        if (this.currentUser) {
            // User is logged in
            elements.loginBtn.innerHTML = `
                <i class="fas fa-user-circle"></i> ${this.currentUser.name.split(' ')[0]}
            `;
            elements.loginBtn.classList.add('logged-in');
            
            if (elements.registerBtn) {
                elements.registerBtn.style.display = 'none';
            }

            // Update click handler for logout
            elements.loginBtn.onclick = () => this.handleLogout();
        } else {
            // User is not logged in
            elements.loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            elements.loginBtn.classList.remove('logged-in');
            
            if (elements.registerBtn) {
                elements.registerBtn.style.display = 'block';
            }

            // Reset click handler for login
            elements.loginBtn.onclick = () => ModalManager.openModal(elements.loginModal);
        }
    }

    static handleLogout() {
        if (confirm(`Are you sure you want to logout, ${this.currentUser?.name}?`)) {
            this.clearSession();
            Toast.show('Logged out successfully', 'success');
        }
    }

    static setupSessionTimeout() {
        if (this.currentUser) {
            this.resetSessionTimeout();
        }
    }

    static resetSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }

        this.sessionTimeout = setTimeout(() => {
            if (this.currentUser) {
                this.clearSession();
                Toast.show('Session expired. Please login again.', 'error');
            }
        }, CONFIG.sessionTimeout);
    }

    static async login(email, password) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem(`${CONFIG.storageKey}_users`) || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                const userData = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    createdAt: user.createdAt
                };

                this.saveSession(userData);
                Toast.show('Login successful! Welcome back!', 'success');
                return { success: true, data: userData };
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            Toast.show(error.message || 'Login failed. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    }

    static async register(userData) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if email already exists
            const users = JSON.parse(localStorage.getItem(`${CONFIG.storageKey}_users`) || '[]');
            if (users.find(u => u.email === userData.email)) {
                throw new Error('Email already registered');
            }

            // Create new user
            const newUser = {
                id: Utils.generateId('user_'),
                ...userData,
                createdAt: new Date().toISOString()
            };

            // Save to localStorage
            users.push(newUser);
            localStorage.setItem(`${CONFIG.storageKey}_users`, JSON.stringify(users));

            Toast.show('Registration successful! You can now login.', 'success');
            return { success: true, data: newUser };
        } catch (error) {
            Toast.show(error.message || 'Registration failed. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    }
}

// ===== ORDER MANAGER =====
class OrderManager {
    static async saveOrder(orderData) {
        try {
            // Generate order ID
            const orderId = Utils.generateId('ORD_');
            const order = {
                id: orderId,
                ...orderData,
                status: 'pending',
                createdAt: new Date().toISOString(),
                userId: AuthManager.currentUser?.id || null
            };

            // Save to localStorage
            const orders = JSON.parse(localStorage.getItem(`${CONFIG.storageKey}_orders`) || '[]');
            orders.push(order);
            localStorage.setItem(`${CONFIG.storageKey}_orders`, JSON.stringify(orders));

            return { success: true, orderId };
        } catch (error) {
            console.error('Error saving order:', error);
            return { success: false, error: error.message };
        }
    }

    static getOrders(userId = null) {
        try {
            const orders = JSON.parse(localStorage.getItem(`${CONFIG.storageKey}_orders`) || '[]');
            
            if (userId) {
                return orders.filter(order => order.userId === userId);
            }
            
            return orders;
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    }
}

// ===== EVENT HANDLERS =====
class EventHandlers {
    static init() {
        // Mobile menu toggle
        if (elements.mobileMenu && elements.navLinks) {
            elements.mobileMenu.addEventListener('click', () => {
                elements.navLinks.classList.toggle('active');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.navbar') && elements.navLinks.classList.contains('active')) {
                    elements.navLinks.classList.remove('active');
                }
            });
        }

        // Modal open handlers
        if (elements.loginBtn) {
            elements.loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!AuthManager.currentUser) {
                    ModalManager.openModal(elements.loginModal);
                }
            });
        }

        if (elements.registerBtn) {
            elements.registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ModalManager.openModal(elements.registerModal);
            });
        }

        // Close button handlers
        if (elements.closeButtons) {
            elements.closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const modal = button.closest('.modal');
                    ModalManager.closeModal(modal);
                });
            });
        }

        // Switch between login and register modals
        if (elements.switchToRegister) {
            elements.switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                ModalManager.closeModal(elements.loginModal);
                ModalManager.openModal(elements.registerModal);
            });
        }

        if (elements.switchToLogin) {
            elements.switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                ModalManager.closeModal(elements.registerModal);
                ModalManager.openModal(elements.loginModal);
            });
        }

        // Form submission handlers
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', this.handleLoginSubmit);
        }

        if (elements.registerForm) {
            elements.registerForm.addEventListener('submit', this.handleRegisterSubmit);
        }

        // Real-time form validation
        this.initRealTimeValidation();
    }

    static async handleLoginSubmit(e) {
        e.preventDefault();
        FormValidator.clearAllErrors();

        const email = elements.loginEmail?.value.trim() || '';
        const password = elements.loginPassword?.value || '';

        // Validate form
        if (!FormValidator.validateLoginForm(email, password)) {
            return;
        }

        const submitBtn = elements.loginForm.querySelector('.btn-submit');
        Utils.showLoading(submitBtn);

        try {
            const result = await AuthManager.login(email, password);
            
            if (result.success) {
                setTimeout(() => {
                    ModalManager.closeModal(elements.loginModal);
                    // Redirect to order page if needed
                    // window.location.href = 'order.html';
                }, 1000);
            }
        } finally {
            Utils.hideLoading(submitBtn);
        }
    }

    static async handleRegisterSubmit(e) {
        e.preventDefault();
        FormValidator.clearAllErrors();

        const formData = {
            name: elements.registerName?.value.trim() || '',
            email: elements.registerEmail?.value.trim() || '',
            phone: Utils.formatPhoneNumber(elements.registerPhone?.value || ''),
            password: elements.registerPassword?.value || '',
            confirmPassword: elements.registerConfirmPassword?.value || ''
        };

        // Validate form
        if (!FormValidator.validateRegisterForm(formData)) {
            return;
        }

        const submitBtn = elements.registerForm.querySelector('.btn-submit');
        Utils.showLoading(submitBtn);

                    if (result.success) {
                setTimeout(() => {
                    ModalManager.closeModal(elements.registerModal);
                    ModalManager.openModal(elements.loginModal);
                }, 1500);
            }
        } finally {
            Utils.hideLoading(submitBtn);
        }
    }

    static initRealTimeValidation() {
        // Login form real-time validation
        if (elements.loginEmail && elements.loginEmailError) {
            elements.loginEmail.addEventListener('input', Utils.debounce(() => {
                const email = elements.loginEmail.value.trim();
                if (!email) {
                    FormValidator.clearError(elements.loginEmailError);
                } else if (!Utils.validateEmail(email)) {
                    FormValidator.showError(elements.loginEmailError, 'Please enter a valid email');
                } else {
                    FormValidator.showSuccess(elements.loginEmailError);
                }
            }, 500));
        }

        if (elements.loginPassword && elements.loginPasswordError) {
            elements.loginPassword.addEventListener('input', Utils.debounce(() => {
                const password = elements.loginPassword.value;
                if (!password) {
                    FormValidator.clearError(elements.loginPasswordError);
                } else if (!Utils.validatePassword(password)) {
                    FormValidator.showError(elements.loginPasswordError, 'At least 6 characters required');
                } else {
                    FormValidator.showSuccess(elements.loginPasswordError);
                }
            }, 500));
        }

        // Register form real-time validation
        if (elements.registerName && elements.registerNameError) {
            elements.registerName.addEventListener('input', Utils.debounce(() => {
                const name = elements.registerName.value.trim();
                if (!name) {
                    FormValidator.clearError(elements.registerNameError);
                } else if (name.length < 2) {
                    FormValidator.showError(elements.registerNameError, 'Name must be at least 2 characters');
                } else {
                    FormValidator.showSuccess(elements.registerNameError);
                }
            }, 500));
        }

        if (elements.registerEmail && elements.registerEmailError) {
            elements.registerEmail.addEventListener('input', Utils.debounce(() => {
                const email = elements.registerEmail.value.trim();
                if (!email) {
                    FormValidator.clearError(elements.registerEmailError);
                } else if (!Utils.validateEmail(email)) {
                    FormValidator.showError(elements.registerEmailError, 'Please enter a valid email');
                } else {
                    FormValidator.showSuccess(elements.registerEmailError);
                }
            }, 500));
        }

        if (elements.registerPhone && elements.registerPhoneError) {
            elements.registerPhone.addEventListener('input', Utils.debounce(() => {
                const phone = Utils.formatPhoneNumber(elements.registerPhone.value || '');
                if (!phone) {
                    FormValidator.clearError(elements.registerPhoneError);
                } else if (!Utils.validatePhone(phone)) {
                    FormValidator.showError(elements.registerPhoneError, 'Please enter a valid phone number');
                } else {
                    FormValidator.showSuccess(elements.registerPhoneError);
                }
            }, 500));
        }

        if (elements.registerPassword && elements.registerPasswordError) {
            elements.registerPassword.addEventListener('input', Utils.debounce(() => {
                const password = elements.registerPassword.value;
                if (!password) {
                    FormValidator.clearError(elements.registerPasswordError);
                } else if (!Utils.validatePassword(password)) {
                    FormValidator.showError(elements.registerPasswordError, 'At least 6 characters required');
                } else {
                    FormValidator.showSuccess(elements.registerPasswordError, '✓ Strong password');
                }
            }, 500));
        }

        if (elements.registerConfirmPassword && elements.registerConfirmPasswordError) {
            elements.registerConfirmPassword.addEventListener('input', Utils.debounce(() => {
                const password = elements.registerPassword?.value || '';
                const confirmPassword = elements.registerConfirmPassword.value;
                
                if (!confirmPassword) {
                    FormValidator.clearError(elements.registerConfirmPasswordError);
                } else if (password !== confirmPassword) {
                    FormValidator.showError(elements.registerConfirmPasswordError, 'Passwords do not match');
                } else {
                    FormValidator.showSuccess(elements.registerConfirmPasswordError, '✓ Passwords match');
                }
            }, 500));
        }
    }

    // Smooth scroll for anchor links
    static initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if href is just "#"
                if (href === '#') return;
                
                // Check if it's an internal anchor link
                if (href.startsWith('#') && href.length > 1) {
                    e.preventDefault();
                    
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        // Close mobile menu if open
                        if (elements.navLinks && elements.navLinks.classList.contains('active')) {
                            elements.navLinks.classList.remove('active');
                        }
                        
                        // Calculate offset for fixed navbar
                        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // Initialize navbar scroll effect
    static initNavbarScroll() {
        let lastScrollTop = 0;
        const navbar = document.querySelector('.navbar');
        
        if (!navbar) return;
        
        window.addEventListener('scroll', Utils.debounce(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove shadow based on scroll position
            if (scrollTop > 50) {
                navbar.style.boxShadow = 'var(--shadow-md)';
            } else {
                navbar.style.boxShadow = 'var(--shadow-sm)';
            }
            
            // Hide/show navbar on scroll direction
            if (scrollTop > 100) {
                if (scrollTop > lastScrollTop) {
                    // Scrolling down
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollTop = scrollTop;
        }, 100));
    }

    // Initialize intersection observers for animations
    static initAnimations() {
        if (!('IntersectionObserver' in window)) return;
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.service-card, .step, .testimonial-card').forEach(element => {
            observer.observe(element);
        });
    }
}

// ===== INITIALIZATION =====
class App {
    static async init() {
        console.log('🚀 Initializing ZACK Delivery App...');
        
        try {
            // Initialize utility classes
            ModalManager.initModalEvents();
            AuthManager.init();
            
            // Initialize event handlers
            EventHandlers.init();
            EventHandlers.initSmoothScroll();
            EventHandlers.initNavbarScroll();
            EventHandlers.initAnimations();
            
            // Check for URL parameters
            this.checkUrlParameters();
            
            // Initialize service workers for PWA (optional)
            if ('serviceWorker' in navigator) {
                this.initServiceWorker();
            }
            
            console.log('✅ App initialized successfully');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
        }
    }

    static checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('orderSuccess')) {
            Toast.show('🎉 Order placed successfully!', 'success');
            
            // Clean URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
        
        if (urlParams.has('auth')) {
            const authAction = urlParams.get('auth');
            if (authAction === 'login') {
                ModalManager.openModal(elements.loginModal);
            } else if (authAction === 'register') {
                ModalManager.openModal(elements.registerModal);
            }
            
            // Clean URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }

    static async initServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration);
        } catch (error) {
            console.log('ℹ️ Service Worker registration failed:', error);
        }
    }

    // Export public API
    static get API() {
        return {
            Auth: AuthManager,
            Order: OrderManager,
            Toast: Toast,
            Modal: ModalManager
        };
    }
}

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    Toast.show('An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Toast.show('Something went wrong. Please try again.', 'error');
});

// ===== START THE APP =====
document.addEventListener('DOMContentLoaded', () => {
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .service-card,
        .step,
        .testimonial-card {
            opacity: 0;
        }
        
        /* Loading spinner animation */
        .fa-spinner.fa-spin {
            animation: fa-spin 2s linear infinite;
        }
        
        @keyframes fa-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the app
    App.init();
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        FormValidator,
        AuthManager,
        OrderManager,
        Toast,
        App
    };
}