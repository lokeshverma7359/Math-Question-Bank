// API Configuration
const API_URL = 'YOUR_API_ENDPOINT_HERE'; // Replace with your actual API endpoint

// Global variables
let allQuestions = [];
let categories = new Set();

// DOM Elements
const questionsContainer = document.getElementById('questionsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const difficultyFilter = document.getElementById('difficultyFilter');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');

// Fetch questions from API
async function fetchQuestions() {
    try {
        loading.classList.remove('d-none');
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        
        const data = await response.json();
        allQuestions = data.questions || data; // Adjust based on your API structure
        
        // Extract unique categories
        allQuestions.forEach(q => {
            if (q.category) categories.add(q.category);
        });
        
        populateCategoryFilter();
        displayQuestions(allQuestions);
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <strong>Error!</strong> Unable to load questions. Please check your API endpoint.
                    <br><small>Error: ${error.message}</small>
                </div>
            </div>
        `;
    } finally {
        loading.classList.add('d-none');
    }
}

// Populate category filter dropdown
function populateCategoryFilter() {
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

// Display questions
function displayQuestions(questions) {
    questionsContainer.innerHTML = '';
    
    if (questions.length === 0) {
        noResults.classList.remove('d-none');
        return;
    }
    
    noResults.classList.add('d-none');
    
    questions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index + 1);
        questionsContainer.appendChild(questionCard);
    });
    
    // Render MathJax after adding questions
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

// Create question card
function createQuestionCard(question, number) {
    const col = document.createElement('div');
    col.className = 'col-12';
    
    const difficultyClass = `difficulty-${question.difficulty || 'medium'}`;
    
    col.innerHTML = `
        <div class="question-card">
            <span class="question-number">Question ${number}</span>
            
            <div class="d-flex flex-wrap gap-2 mb-3">
                ${question.category ? `<span class="badge-category">${question.category}</span>` : ''}
                ${question.difficulty ? `<span class="badge-difficulty ${difficultyClass}">${question.difficulty.toUpperCase()}</span>` : ''}
            </div>
            
            <div class="question-text">
                ${question.question || question.text || 'No question text available'}
            </div>
            
            ${question.answer ? `
                <div class="answer-section">
                    <button class="btn btn-sm btn-outline-primary answer-btn" onclick="toggleAnswer(${number})">
                        <span id="answer-icon-${number}">👁️ Show Answer</span>
                    </button>
                    <div id="answer-${number}" class="answer-content d-none">
                        <strong>Answer:</strong><br>
                        ${question.answer}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    return col;
}

// Toggle answer visibility
function toggleAnswer(number) {
    const answerDiv = document.getElementById(`answer-${number}`);
    const icon = document.getElementById(`answer-icon-${number}`);
    
    if (answerDiv.classList.contains('d-none')) {
        answerDiv.classList.remove('d-none');
        icon.textContent = '🙈 Hide Answer';
    } else {
        answerDiv.classList.add('d-none');
        icon.textContent = '👁️ Show Answer';
    }
}

// Filter questions
function filterQuestions() {
    const selectedCategory = categoryFilter.value;
    const selectedDifficulty = difficultyFilter.value;
    
    let filtered = allQuestions;
    
    if (selectedCategory !== 'all') {
        filtered = filtered.filter(q => q.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }
    
    displayQuestions(filtered);
}

// Event listeners
categoryFilter.addEventListener('change', filterQuestions);
difficultyFilter.addEventListener('change', filterQuestions);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
});

// Sample data structure for reference (remove this in production)
/* 
Expected JSON structure:
{
    "questions": [
        {
            "question": "Solve for x: \\(x^2 + 5x + 6 = 0\\)",
            "answer": "\\(x = -2\\) or \\(x = -3\\)",
            "category": "algebra",
            "difficulty": "easy"
        },
        {
            "question": "Find the derivative of \\(f(x) = 3x^2 + 2x + 1\\)",
            "answer": "\\(f'(x) = 6x + 2\\)",
            "category": "calculus",
            "difficulty": "medium"
        }
    ]
}
*/