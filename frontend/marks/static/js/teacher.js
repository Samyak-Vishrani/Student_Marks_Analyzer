document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = localStorage.getItem('userData');
    const userType = localStorage.getItem('userType');
    
    if (!userData || userType !== 'teacher') {
        // Redirect to login page if not logged in as teacher
        window.location.href = '/';
        return;
    }
    
    // Parse user data
    const teacher = JSON.parse(userData);
    
    // Display teacher information
    document.getElementById('teacher-name').textContent = teacher.name;
    document.getElementById('teacher-sapid').textContent = teacher.sapid;
    
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
            
            // Load data for the active tab if needed
            if (tabId === 'subjects') {
                loadSubjects();
            } else if (tabId === 'tests') {
                loadTests();
                loadSubjectsForFilter();
            } else if (tabId === 'scores') {
                loadScores();
                loadTestsForFilter();
            }
        });
    });
    
    // Initial data loading
    loadSubjects();
    setupModalClosers();
    setupFormHandlers();
    
    // Add event listeners for add buttons
    document.getElementById('add-subject-btn').addEventListener('click', showAddSubjectModal);
    document.getElementById('add-test-btn').addEventListener('click', showAddTestModal);
    document.getElementById('add-score-btn').addEventListener('click', showAddScoreModal);
    
    // Add event listener for subject filter
    document.getElementById('subject-filter').addEventListener('change', function() {
        loadTests(this.value);
    });
    
    // Add event listener for test filter
    document.getElementById('test-filter').addEventListener('change', function() {
        loadScores(this.value);
    });
});

// Function to close all modals
function setupModalClosers() {
    // Get all elements with class "close"
    const closeButtons = document.querySelectorAll('.close');
    
    // Add click event listener to each close button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the parent modal
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Function to setup form handlers
function setupFormHandlers() {
    // Subject form
    document.getElementById('subject-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const subjectId = document.getElementById('subject-id').value;
        const name = document.getElementById('subject-name').value;
        
        if (subjectId) {
            // Update existing subject
            updateSubject(subjectId, name);
        } else {
            // Create new subject
            createSubject(name);
        }
    });
    
    // Test form
    document.getElementById('test-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const testId = document.getElementById('test-id').value;
        const name = document.getElementById('test-name').value;
        const subjectId = document.getElementById('test-subject').value;
        const maxMarks = document.getElementById('test-max-marks').value;
        const className = document.getElementById('test-class').value;
        
        const testData = {
            name: name,
            subject: subjectId,
            max_marks: maxMarks,
            class_name: className
        };
        
        if (testId) {
            // Update existing test
            updateTest(testId, testData);
        } else {
            // Create new test
            createTest(testData);
        }
    });
    
    // Score form
    document.getElementById('score-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const scoreId = document.getElementById('score-id').value;
        const testId = document.getElementById('score-test').value;
        const studentId = document.getElementById('score-student').value;
        const scoreValue = document.getElementById('score-value').value;
        
        const scoreData = {
            test: testId,
            student: studentId,
            score: scoreValue
        };
        
        if (scoreId) {
            // Update existing score
            updateScore(scoreId, scoreData);
        } else {
            // Create new score
            createScore(scoreData);
        }
    });
}

// ==================== SUBJECTS ====================

// Function to load subjects
function loadSubjects() {
    const subjectsList = document.getElementById('subjects-list');
    subjectsList.innerHTML = '<div class="loading">Loading subjects...</div>';
    
    fetch('/api/subjects/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch subjects');
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                let html = '<table>';
                html += '<thead><tr><th>ID</th><th>Subject Name</th><th>Actions</th></tr></thead>';
                html += '<tbody>';
                
                data.results.forEach(subject => {
                    html += '<tr>';
                    html += `<td>${subject.id}</td>`;
                    html += `<td>${subject.name}</td>`;
                    html += '<td class="action-buttons">';
                    html += `<button class="btn btn-sm btn-edit" onclick="showEditSubjectModal(${subject.id}, '${subject.name}')">Edit</button>`;
                    html += `<button class="btn btn-sm btn-delete" onclick="deleteSubject(${subject.id})">Delete</button>`;
                    html += '</td>';
                    html += '</tr>';
                });
                
                html += '</tbody></table>';
                subjectsList.innerHTML = html;
            } else {
                subjectsList.innerHTML = '<p>No subjects found. Add a new subject to get started.</p>';
            }
        })
        .catch(error => {
            subjectsList.innerHTML = '<p>Error loading subjects. Please try again later.</p>';
            console.error('Error:', error);
        });
}

// Function to show add subject modal
function showAddSubjectModal() {
    // Reset form
    document.getElementById('subject-form').reset();
    document.getElementById('subject-id').value = '';
    document.getElementById('subject-modal-title').textContent = 'Add Subject';
    
    // Show modal
    document.getElementById('subject-modal').style.display = 'block';
}

// Function to show edit subject modal
function showEditSubjectModal(id, name) {
    // Set form values
    document.getElementById('subject-id').value = id;
    document.getElementById('subject-name').value = name;
    document.getElementById('subject-modal-title').textContent = 'Edit Subject';
    
    // Show modal
    document.getElementById('subject-modal').style.display = 'block';
}

// Function to create a new subject
function createSubject(name) {
    fetch('/api/subjects/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create subject');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('subject-modal').style.display = 'none';
        
        // Reload subjects
        loadSubjects();
        
        // Show success message
        alert('Subject created successfully!');
    })
    .catch(error => {
        alert('Error creating subject. Please try again.');
        console.error('Error:', error);
    });
}

// Function to update a subject
function updateSubject(id, name) {
    fetch(`/api/subjects/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, name: name }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update subject');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('subject-modal').style.display = 'none';
        
        // Reload subjects
        loadSubjects();
        
        // Show success message
        alert('Subject updated successfully!');
    })
    .catch(error => {
        alert('Error updating subject. Please try again.');
        console.error('Error:', error);
    });
}

// Function to delete a subject
function deleteSubject(id) {
    if (confirm('Are you sure you want to delete this subject? This will also delete all associated tests and scores.')) {
        fetch(`/api/subjects/${id}/`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete subject');
            }
            // Reload subjects
            loadSubjects();
            
            // Show success message
            alert('Subject deleted successfully!');
        })
        .catch(error => {
            alert('Error deleting subject. Please try again.');
            console.error('Error:', error);
        });
    }
}

// ==================== TESTS ====================

// Function to load subjects for test filter
function loadSubjectsForFilter() {
    fetch('/api/subjects/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch subjects');
            }
            return response.json();
        })
        .then(data => {
            const subjectFilter = document.getElementById('subject-filter');
            const testSubject = document.getElementById('test-subject');
            
            // Clear previous options
            subjectFilter.innerHTML = '<option value="">All Subjects</option>';
            testSubject.innerHTML = '<option value="">Select Subject</option>';
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(subject => {
                    // Add to filter
                    const filterOption = document.createElement('option');
                    filterOption.value = subject.id;
                    filterOption.textContent = subject.name;
                    subjectFilter.appendChild(filterOption);
                    
                    // Add to test form
                    const formOption = document.createElement('option');
                    formOption.value = subject.id;
                    formOption.textContent = subject.name;
                    testSubject.appendChild(formOption);
                });
            }
        })
        .catch(error => {
            console.error('Error loading subjects:', error);
        });
}

// Function to load tests
function loadTests(subjectId = '') {
    const testsList = document.getElementById('tests-list');
    testsList.innerHTML = '<div class="loading">Loading tests...</div>';
    
    let url = '/api/tests/';
    if (subjectId) {
        url += `?subject=${subjectId}`;
    }
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tests');
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                let html = '<table>';
                html += '<thead><tr><th>ID</th><th>Test Name</th><th>Subject</th><th>Max Marks</th><th>Class</th><th>Actions</th></tr></thead>';
                html += '<tbody>';
                
                data.results.forEach(test => {
                    html += '<tr>';
                    html += `<td>${test.id}</td>`;
                    html += `<td>${test.name}</td>`;
                    html += `<td>${test.subject}</td>`; // This will show subject ID; for name, we'd need to fetch subjects separately
                    html += `<td>${test.max_marks}</td>`;
                    html += `<td>${test.class_name}</td>`;
                    html += '<td class="action-buttons">';
                    html += `<button class="btn btn-sm btn-edit" onclick="showEditTestModal(${test.id})">Edit</button>`;
                    html += `<button class="btn btn-sm btn-delete" onclick="deleteTest(${test.id})">Delete</button>`;
                    html += `<button class="btn btn-sm btn-view" onclick="showTestStatistics(${test.id})">Statistics</button>`;
                    html += '</td>';
                    html += '</tr>';
                });
                
                html += '</tbody></table>';
                testsList.innerHTML = html;
            } else {
                testsList.innerHTML = '<p>No tests found. Add a new test to get started.</p>';
            }
        })
        .catch(error => {
            testsList.innerHTML = '<p>Error loading tests. Please try again later.</p>';
            console.error('Error:', error);
        });
}

// Function to show add test modal
function showAddTestModal() {
    // Reset form
    document.getElementById('test-form').reset();
    document.getElementById('test-id').value = '';
    document.getElementById('test-modal-title').textContent = 'Add Test';
    
    // Show modal
    document.getElementById('test-modal').style.display = 'block';
}

// Function to show edit test modal
function showEditTestModal(id) {
    // Fetch test details
    fetch(`/api/tests/${id}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch test details');
            }
            return response.json();
        })
        .then(test => {
            // Set form values
            document.getElementById('test-id').value = test.id;
            document.getElementById('test-name').value = test.name;
            document.getElementById('test-subject').value = test.subject;
            document.getElementById('test-max-marks').value = test.max_marks;
            document.getElementById('test-class').value = test.class_name;
            document.getElementById('test-modal-title').textContent = 'Edit Test';
            
            // Show modal
            document.getElementById('test-modal').style.display = 'block';
        })
        .catch(error => {
            alert('Error loading test details. Please try again.');
            console.error('Error:', error);
        });
}

// Function to create a new test
function createTest(testData) {
    fetch('/api/tests/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create test');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('test-modal').style.display = 'none';
        
        // Reload tests
        loadTests();
        
        // Show success message
        alert('Test created successfully!');
    })
    .catch(error => {
        alert('Error creating test. Please try again.');
        console.error('Error:', error);
    });
}

// Function to update a test
function updateTest(id, testData) {
    fetch(`/api/tests/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update test');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('test-modal').style.display = 'none';
        
        // Reload tests
        loadTests();
        
        // Show success message
        alert('Test updated successfully!');
    })
    .catch(error => {
        alert('Error updating test. Please try again.');
        console.error('Error:', error);
    });
}

// Function to delete a test
function deleteTest(id) {
    if (confirm('Are you sure you want to delete this test? This will also delete all associated scores.')) {
        fetch(`/api/tests/${id}/`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete test');
            }
            // Reload tests
            loadTests();
            
            // Show success message
            alert('Test deleted successfully!');
        })
        .catch(error => {
            alert('Error deleting test. Please try again.');
            console.error('Error:', error);
        });
    }
}

// Function to show test statistics
function showTestStatistics(testId) {
    const statsContainer = document.getElementById('test-stats-container');
    statsContainer.innerHTML = '<div class="loading">Loading statistics...</div>';
    
    // Show modal
    document.getElementById('stats-modal').style.display = 'block';
    
    fetch(`/api/test-statistics/${testId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch test statistics');
            }
            return response.json();
        })
        .then(stats => {
            let html = '';
            
            // Test info
            html += `<h4>${stats.test_name} (${stats.subject})</h4>`;
            
            // Stats cards
            html += '<div class="stats-container">';
            
            // Total students
            html += '<div class="stat-card">';
            html += `<div class="stat-number">${stats.total_students}</div>`;
            html += '<div class="stat-label">Total Students</div>';
            html += '</div>';
            
            // Passed students
            html += '<div class="stat-card">';
            html += `<div class="stat-number">${stats.passed_students}</div>`;
            html += '<div class="stat-label">Passed</div>';
            html += '</div>';
            
            // Failed students
            html += '<div class="stat-card">';
            html += `<div class="stat-number">${stats.failed_students}</div>`;
            html += '<div class="stat-label">Failed</div>';
            html += '</div>';
            
            // Pass percentage
            html += '<div class="stat-card">';
            html += `<div class="stat-number">${stats.pass_percentage.toFixed(2)}%</div>`;
            html += '<div class="stat-label">Pass Percentage</div>';
            html += '</div>';
            
            // Highest score
            html += '<div class="stat-card">';
            html += `<div class="stat-number">${stats.highest_score}</div>`;
            html += '<div class="stat-label">Highest Score</div>';
            html += '</div>';
            
            // Lowest score
            html += '<div class="stat-card">';
            html += `<div class="stat-number">${stats.lowest_score}</div>`;
            html += '<div class="stat-label">Lowest Score</div>';
            html += '</div>';
            
            // Average score
            html += '<div class="stat-card">';
            html += `<div class="stat-number">${stats.average_score.toFixed(2)}</div>`;
            html += '<div class="stat-label">Average Score</div>';
            html += '</div>';
            
            html += '</div>'; // End stats-container
            
            // Add a button to view detailed results
            html += `<button class="btn" onclick="window.location.href='/api/test-results/${testId}/'">View Detailed Results</button>`;
            
            statsContainer.innerHTML = html;
        })
        .catch(error => {
            statsContainer.innerHTML = '<p>Error loading test statistics. Please try again later.</p>';
            console.error('Error:', error);
        });
}

// ==================== SCORES ====================

// Function to load tests for score filter and form
function loadTestsForFilter() {
    fetch('/api/tests/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tests');
            }
            return response.json();
        })
        .then(data => {
            const testFilter = document.getElementById('test-filter');
            const scoreTestSelect = document.getElementById('score-test');
            
            // Clear previous options
            testFilter.innerHTML = '<option value="">All Tests</option>';
            scoreTestSelect.innerHTML = '<option value="">Select Test</option>';
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(test => {
                    // Add to filter
                    const filterOption = document.createElement('option');
                    filterOption.value = test.id;
                    filterOption.textContent = test.name;
                    testFilter.appendChild(filterOption);
                    
                    // Add to score form
                    const formOption = document.createElement('option');
                    formOption.value = test.id;
                    formOption.textContent = test.name;
                    scoreTestSelect.appendChild(formOption);
                });
            }
        })
        .catch(error => {
            console.error('Error loading tests:', error);
        });
    
    // Also load students for the score form
    fetch('/api/students/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            return response.json();
        })
        .then(data => {
            const scoreStudentSelect = document.getElementById('score-student');
            
            // Clear previous options
            scoreStudentSelect.innerHTML = '<option value="">Select Student</option>';
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.sapid;
                    option.textContent = `${student.name} (${student.roll_no})`;
                    scoreStudentSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading students:', error);
        });
}

// Function to load scores
function loadScores(testId = '') {
    const scoresList = document.getElementById('scores-list');
    scoresList.innerHTML = '<div class="loading">Loading scores...</div>';
    
    let url = '/api/scores/';
    if (testId) {
        url += `?test=${testId}`;
    }
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch scores');
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                let html = '<table>';
                html += '<thead><tr><th>ID</th><th>Student</th><th>Test</th><th>Score</th><th>Status</th><th>Rank</th><th>Actions</th></tr></thead>';
                html += '<tbody>';
                
                data.results.forEach(score => {
                    html += '<tr>';
                    html += `<td>${score.id}</td>`;
                    html += `<td>${score.student_name}</td>`;
                    html += `<td>${score.test_name}</td>`;
                    html += `<td>${score.score}</td>`;
                    html += `<td class="${score.is_pass ? 'pass' : 'fail'}">${score.is_pass ? 'Pass' : 'Fail'}</td>`;
                    html += `<td>${score.rank}</td>`;
                    html += '<td class="action-buttons">';
                    html += `<button class="btn btn-sm btn-edit" onclick="showEditScoreModal(${score.id})">Edit</button>`;
                    html += `<button class="btn btn-sm btn-delete" onclick="deleteScore(${score.id})">Delete</button>`;
                    html += '</td>';
                    html += '</tr>';
                });
                
                html += '</tbody></table>';
                scoresList.innerHTML = html;
            } else {
                scoresList.innerHTML = '<p>No scores found. Add a new score to get started.</p>';
            }
        })
        .catch(error => {
            scoresList.innerHTML = '<p>Error loading scores. Please try again later.</p>';
            console.error('Error:', error);
        });
}

// Function to show add score modal
function showAddScoreModal() {
    // Reset form
    document.getElementById('score-form').reset();
    document.getElementById('score-id').value = '';
    document.getElementById('score-modal-title').textContent = 'Add Score';
    
    // Show modal
    document.getElementById('score-modal').style.display = 'block';
}

// Function to show edit score modal
function showEditScoreModal(id) {
    // Fetch score details
    fetch(`/api/scores/${id}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch score details');
            }
            return response.json();
        })
        .then(score => {
            // Set form values
            document.getElementById('score-id').value = score.id;
            document.getElementById('score-test').value = score.test;
            document.getElementById('score-student').value = score.student;
            document.getElementById('score-value').value = score.score;
            document.getElementById('score-modal-title').textContent = 'Edit Score';
            
            // Show modal
            document.getElementById('score-modal').style.display = 'block';
        })
        .catch(error => {
            alert('Error loading score details. Please try again.');
            console.error('Error:', error);
        });
}

// Function to create a new score
function createScore(scoreData) {
    fetch('/api/scores/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create score');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('score-modal').style.display = 'none';
        
        // Reload scores
        loadScores();
        
        // Show success message
        alert('Score created successfully!');
    })
    .catch(error => {
        alert('Error creating score. Please try again.');
        console.error('Error:', error);
    });
}

// Function to update a score
function updateScore(id, scoreData) {
    fetch(`/api/scores/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update score');
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('score-modal').style.display = 'none';
        
        // Reload scores
        loadScores();
        
        // Show success message
        alert('Score updated successfully!');
    })
    .catch(error => {
        alert('Error updating score. Please try again.');
        console.error('Error:', error);
    });
}

// Function to delete a score
function deleteScore(id) {
    if (confirm('Are you sure you want to delete this score?')) {
        fetch(`/api/scores/${id}/`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete score');
            }
            // Reload scores
            loadScores();
            
            // Show success message
            alert('Score deleted successfully!');
        })
        .catch(error => {
            alert('Error deleting score. Please try again.');
            console.error('Error:', error);
        });
    }
}