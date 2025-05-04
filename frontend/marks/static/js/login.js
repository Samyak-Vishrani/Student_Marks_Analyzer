document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(button => {
        button.addEventListener('click', function() {
            // Update active tab button
            tabBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(`${tabId}-tab`).style.display = 'block';
        });
    });

    // Check if user is already logged in
    const userData = localStorage.getItem('userData');
    const userType = localStorage.getItem('userType');
    
    if (userData && userType) {
        // Redirect to the appropriate dashboard
        window.location.href = userType === 'student' ? '/student-dashboard/' : '/teacher-dashboard/';
        return;
    }

    // Student login form submission
    const studentLoginForm = document.getElementById('student-login-form');
    studentLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const sapid = document.getElementById('student-sapid').value;
        const password = document.getElementById('student-password').value;
        const errorElement = document.getElementById('student-login-error');
        
        // Clear previous error messages
        errorElement.textContent = '';
        
        // Make API request
        fetch('/api/student-login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sapid, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            // Store user data in localStorage
            localStorage.setItem('userData', JSON.stringify(data));
            localStorage.setItem('userType', 'student');
            
            // Redirect to student dashboard
            window.location.href = '/student-dashboard/';
        })
        .catch(error => {
            errorElement.textContent = 'Invalid SAP ID or password. Please try again.';
        });
    });

    // Teacher login form submission
    const teacherLoginForm = document.getElementById('teacher-login-form');
    teacherLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const sapid = document.getElementById('teacher-sapid').value;
        const password = document.getElementById('teacher-password').value;
        const errorElement = document.getElementById('teacher-login-error');
        
        // Clear previous error messages
        errorElement.textContent = '';
        
        // Make API request
        fetch('/api/teacher-login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sapid, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            // Store user data in localStorage
            localStorage.setItem('userData', JSON.stringify(data));
            localStorage.setItem('userType', 'teacher');
            
            // Redirect to teacher dashboard
            window.location.href = '/teacher-dashboard/';
        })
        .catch(error => {
            errorElement.textContent = 'Invalid SAP ID or password. Please try again.';
        });
    });
});
