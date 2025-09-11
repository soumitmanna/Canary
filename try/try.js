        document.addEventListener('DOMContentLoaded', function() {
            const overlay = document.getElementById('loginOverlay');
            const showLoginBtn = document.getElementById('showLogin');
            const closeLoginBtn = document.getElementById('closeLogin');
            const loginForm = document.getElementById('loginForm');
            const body = document.body;
            
            // Show login overlay
            showLoginBtn.addEventListener('click', function() {
                overlay.classList.add('active');
                body.classList.add('overlay-active');
            });
            
            // Hide login overlay
            closeLoginBtn.addEventListener('click', function() {
                overlay.classList.remove('active');
                body.classList.remove('overlay-active');
            });
            
            // Hide overlay when clicking outside of login container
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    body.classList.remove('overlay-active');
                }
            });
            
            // Handle form submission
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                // Here you would typically send this data to your server
                console.log('Login attempt with:', { email, password });
                
                // Simulate successful login
                alert('Login successful! Redirecting...');
                overlay.classList.remove('active');
                body.classList.remove('overlay-active');
            });
            
            // Add escape key to close overlay
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && overlay.classList.contains('active')) {
                    overlay.classList.remove('active');
                    body.classList.remove('overlay-active');
                }
            });
        });