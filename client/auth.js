// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state and update navbar after a small delay to ensure elements are ready
    setTimeout(checkAuthenticationState, 100);
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const password = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (password.type === 'password') {
                password.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                password.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const confirmPassword = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            
            if (confirmPassword.type === 'password') {
                confirmPassword.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                confirmPassword.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateLoginForm()) {
                return;
            }

            const formData = new FormData(loginForm);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...';
                submitBtn.disabled = true;

                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                const data = await response.json();

                if (data.message === 'Login successful') {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    showAlert('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/resume-builder.html';
                    }, 1500);
                } else {
                    showAlert(data.message || 'Login failed', 'danger');
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

            } catch (error) {
                console.error('Login error:', error);
                showAlert('Network error. Please try again.', 'danger');
                
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Sign In';
                submitBtn.disabled = false;
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateRegisterForm()) {
                return;
            }

            const formData = new FormData(registerForm);
            const registerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
                submitBtn.disabled = true;

                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(registerData)
                });

                const data = await response.json();

                if (data.message === 'User created successfully') {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    showAlert('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/resume-builder.html';
                    }, 1500);
                } else {
                    showAlert(data.message || 'Registration failed', 'danger');
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

            } catch (error) {
                console.error('Registration error:', error);
                showAlert('Network error. Please try again.', 'danger');
                
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Create Account';
                submitBtn.disabled = false;
            }
        });
    }

    // Validation functions
    function validateLoginForm() {
        let isValid = true;
        const email = document.getElementById('email');
        const password = document.getElementById('password');

        // Reset validation
        email.classList.remove('is-invalid');
        password.classList.remove('is-invalid');

        // Email validation
        if (!email.value.trim() || !isValidEmail(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        }

        // Password validation
        if (!password.value.trim()) {
            password.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    function validateRegisterForm() {
        let isValid = true;
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const agreeTerms = document.getElementById('agreeTerms');

        // Reset validation
        [name, email, password, confirmPassword, agreeTerms].forEach(field => {
            field.classList.remove('is-invalid');
        });

        // Name validation
        if (!name.value.trim()) {
            name.classList.add('is-invalid');
            isValid = false;
        }

        // Email validation
        if (!email.value.trim() || !isValidEmail(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        }

        // Password validation
        if (!password.value.trim() || password.value.length < 6) {
            password.classList.add('is-invalid');
            isValid = false;
        }

        // Confirm password validation
        if (password.value !== confirmPassword.value) {
            confirmPassword.classList.add('is-invalid');
            isValid = false;
        }

        // Terms validation
        if (!agreeTerms.checked) {
            agreeTerms.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert alert at the top of the form
        const form = document.querySelector('form');
        form.parentNode.insertBefore(alert, form);
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token && (window.location.pathname === '/login.html' || window.location.pathname === '/register.html')) {
        window.location.href = '/resume-builder.html';
    }
});

// Authentication state management for navbar
function checkAuthenticationState() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        // User is logged in
        const userData = JSON.parse(user);
        const loginNav = document.getElementById('loginNav');
        const registerNav = document.getElementById('registerNav');
        const userNav = document.getElementById('userNav');
        const userName = document.getElementById('userName');
        
        if (loginNav) loginNav.style.display = 'none';
        if (registerNav) registerNav.style.display = 'none';
        if (userNav) userNav.style.display = 'block';
        if (userName) userName.textContent = userData.name;
        
        // Add logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('resumeData'); // Clear resume data too
                window.location.href = '/';
            });
        }
    } else {
        // User is not logged in - show login/register links
        const loginNav = document.getElementById('loginNav');
        const registerNav = document.getElementById('registerNav');
        const userNav = document.getElementById('userNav');
        
        if (loginNav) loginNav.style.display = 'block';
        if (registerNav) registerNav.style.display = 'block';
        if (userNav) userNav.style.display = 'none';
    }
}
