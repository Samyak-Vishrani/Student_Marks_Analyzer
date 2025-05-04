document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = localStorage.getItem('userData');
    const userType = localStorage.getItem('userType');
    
    if (!userData || userType !== 'student') {
        // Redirect to login page if not logged in as student
        window.location.href = '/';
        return;
    }
    
    // Parse user data
    const student = JSON.parse(userData);
    
    // Display student information
    document.getElementById('student-name').textContent = student.name;
    document.getElementById('student-sapid').textContent = student.sapid;
    document.getElementById('student-roll').textContent = student.roll_no;
    document.getElementById('student-class').textContent = student.dept_class;
    
    // Fetch student results
    fetchStudentResults(student.sapid);
});

// Function to fetch student results
function fetchStudentResults(studentId) {
    const resultsContainer = document.getElementById('test-results-container');
    
    fetch(`/api/student-results/${studentId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }
            return response.json();
        })
        .then(data => {
            if (data.tests && data.tests.length > 0) {
                // Create HTML to display results
                let html = '<table>';
                html += '<thead><tr><th>Test</th><th>Subject</th><th>Score</th><th>Max Marks</th><th>Status</th><th>Rank</th></tr></thead>';
                html += '<tbody>';
                
                // Group tests by subject
                const subjectTests = {};
                
                data.tests.forEach(test => {
                    const subject = test.test_name.split(' - ')[1]; // Assuming format "Test Name - Subject Name"
                    if (!subjectTests[subject]) {
                        subjectTests[subject] = [];
                    }
                    subjectTests[subject].push(test);
                });
                
                // Display tests grouped by subject
                for (const subject in subjectTests) {
                    html += `<tr><td colspan="6" class="subject-header"><strong>${subject}</strong></td></tr>`;
                    
                    subjectTests[subject].forEach(test => {
                        const maxMarks = 100; // Replace with actual max marks once we have that data
                        const status = test.is_pass ? 'Pass' : 'Fail';
                        const statusClass = test.is_pass ? 'pass' : 'fail';
                        
                        html += '<tr>';
                        html += `<td>${test.test_name.split(' - ')[0]}</td>`; // Test name without subject
                        html += `<td>${subject}</td>`;
                        html += `<td>${test.score}</td>`;
                        html += `<td>${maxMarks}</td>`;
                        html += `<td class="${statusClass}">${status}</td>`;
                        html += `<td>${test.rank}</td>`;
                        html += '</tr>';
                    });
                }
                
                html += '</tbody></table>';
                resultsContainer.innerHTML = html;
            } else {
                resultsContainer.innerHTML = '<p>No test results found.</p>';
            }
        })
        .catch(error => {
            resultsContainer.innerHTML = '<p>Error loading test results. Please try again later.</p>';
            console.error('Error:', error);
        });
}