let currentQuestionIndex = 0;

const questionText = document.getElementById('question-text');
const choicesBlock = document.getElementById('choices-block');
const resultBlock = document.getElementById('result-block');
const correctAnswerNumber = document.getElementById('correct-answer-number');
const explanationText = document.getElementById('explanation-text');
const sourceText = document.getElementById('source-text');
const progressText = document.getElementById('progress');
const nextBtn = document.getElementById('next-btn');

function init() {
    currentQuestionIndex = 0;
    if (typeof quizData !== 'undefined' && quizData.length > 0) {
        loadQuestion(currentQuestionIndex);
    } else {
        questionText.textContent = "問題データが見つかりません。";
    }
}

function loadQuestion(index) {
    const data = quizData[index];
    questionText.textContent = data.question;
    progressText.textContent = `問題 ${index + 1} / ${quizData.length}`;
    
    // Reset choices and result block
    choicesBlock.innerHTML = '';
    resultBlock.classList.add('hidden');
    resultBlock.classList.remove('active');

    // Create choice buttons
    data.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.classList.add('choice-btn');
        btn.innerHTML = `<span class="choice-number">${i + 1}</span> <span>${choice}</span>`;
        btn.addEventListener('click', () => checkAnswer(i, btn));
        choicesBlock.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, selectedBtn) {
    const data = quizData[currentQuestionIndex];
    const isCorrect = (selectedIndex + 1) === data.answer;
    
    // Disable all buttons
    const allBtns = document.querySelectorAll('.choice-btn');
    allBtns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === (data.answer - 1)) {
            // Highlight the correct answer even if not selected
            btn.classList.add('correct');
        }
    });

    if (!isCorrect) {
        selectedBtn.classList.add('incorrect');
    }

    showExplanation(data);
}

function showExplanation(data) {
    correctAnswerNumber.textContent = data.answer;
    explanationText.textContent = data.explanation;
    sourceText.textContent = data.source;

    resultBlock.classList.remove('hidden');
    // small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        resultBlock.classList.add('active');
    }, 10);
    
    // Scroll to bottom so next button is visible
    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion(currentQuestionIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Quiz finished
        questionText.textContent = "すべての問題が完了しました！お疲れ様でした。";
        choicesBlock.innerHTML = '';
        resultBlock.classList.add('hidden');
        progressText.textContent = "完了";
        
        // Add a restart button
        const restartBtn = document.createElement('button');
        restartBtn.textContent = "最初からやり直す";
        restartBtn.className = "next-btn";
        restartBtn.onclick = init;
        choicesBlock.appendChild(restartBtn);
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', init);
