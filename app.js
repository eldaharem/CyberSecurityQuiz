let currentMode = '';
let currentQuizQueue = [];
let currentQueueIndex = 0;
let appState = {
    sequentialIndex: 0,
    incorrectIds: []
};

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const progressText = document.getElementById('progress');
const questionText = document.getElementById('question-text');
const choicesBlock = document.getElementById('choices-block');
const resultBlock = document.getElementById('result-block');
const correctAnswerNumber = document.getElementById('correct-answer-number');
const explanationText = document.getElementById('explanation-text');
const sourceText = document.getElementById('source-text');
const nextBtn = document.getElementById('next-btn');

const modeSequentialBtn = document.getElementById('mode-sequential');
const modeShuffleBtn = document.getElementById('mode-shuffle');
const modeRandom50Btn = document.getElementById('mode-random50');
const modeReviewBtn = document.getElementById('mode-review');
const btnResetData = document.getElementById('btn-reset-data');
const btnBackHome = document.getElementById('btn-back-home');

function loadState() {
    const saved = localStorage.getItem('secQuizState');
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse saved state", e);
        }
    }
    if (!appState.incorrectIds) appState.incorrectIds = [];
    if (typeof appState.sequentialIndex !== 'number') appState.sequentialIndex = 0;
}

function saveState() {
    localStorage.setItem('secQuizState', JSON.stringify(appState));
}

function init() {
    // Assign original indices to track them across shuffled arrays
    if (typeof quizData !== 'undefined') {
        quizData.forEach((q, i) => { q.originalIndex = i; });
    }
    loadState();
    updateHomeUI();
}

function updateHomeUI() {
    if (appState.sequentialIndex > 0 && appState.sequentialIndex < quizData.length) {
        modeSequentialBtn.textContent = `順番に出題 (問${appState.sequentialIndex + 1}から再開)`;
    } else if (appState.sequentialIndex >= quizData.length) {
        modeSequentialBtn.textContent = `順番に出題 (全問クリア！最初から)`;
    } else {
        modeSequentialBtn.textContent = `順番に出題 (最初から)`;
    }

    if (appState.incorrectIds.length === 0) {
        modeReviewBtn.disabled = true;
        modeReviewBtn.textContent = `間違えた問題だけ復習 (対象なし)`;
    } else {
        modeReviewBtn.disabled = false;
        modeReviewBtn.textContent = `間違えた問題だけ復習 (${appState.incorrectIds.length}問)`;
    }
    
    showScreen('home');
}

function showScreen(screen) {
    if (screen === 'home') {
        quizScreen.classList.remove('active');
        quizScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
        homeScreen.classList.add('active');
        updateHomeUI();
    } else if (screen === 'quiz') {
        homeScreen.classList.remove('active');
        homeScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        quizScreen.classList.add('active');
    }
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startQuiz(mode) {
    currentMode = mode;
    currentQueueIndex = 0;

    if (mode === 'sequential') {
        if (appState.sequentialIndex >= quizData.length) {
            appState.sequentialIndex = 0; // Reset if already finished
        }
        currentQueueIndex = appState.sequentialIndex;
        currentQuizQueue = [...quizData];
    } else if (mode === 'shuffle') {
        currentQuizQueue = shuffleArray(quizData);
    } else if (mode === 'random50') {
        currentQuizQueue = shuffleArray(quizData).slice(0, 50);
    } else if (mode === 'review') {
        const incorrectQs = quizData.filter(q => appState.incorrectIds.includes(q.originalIndex));
        currentQuizQueue = shuffleArray(incorrectQs);
    }

    if (currentQuizQueue.length === 0) {
        alert("出題する問題がありません。");
        return;
    }

    showScreen('quiz');
    loadQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadQuestion() {
    if (currentMode === 'sequential') {
        if (currentQueueIndex >= currentQuizQueue.length) {
            finishQuiz();
            return;
        }
    } else {
        if (currentQueueIndex >= currentQuizQueue.length) {
            finishQuiz();
            return;
        }
    }

    const data = currentQuizQueue[currentQueueIndex];
    questionText.textContent = data.question;
    
    if (currentMode === 'sequential') {
        progressText.textContent = `問題 ${currentQueueIndex + 1} / ${currentQuizQueue.length}`;
    } else {
        progressText.textContent = `問題 ${currentQueueIndex + 1} / ${currentQuizQueue.length} (${currentMode === 'review' ? '復習' : 'ランダム'})`;
    }
    
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
    const data = currentQuizQueue[currentQueueIndex];
    const isCorrect = (selectedIndex + 1) === data.answer;
    
    // Disable all buttons
    const allBtns = document.querySelectorAll('.choice-btn');
    allBtns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === (data.answer - 1)) {
            btn.classList.add('correct');
        }
    });

    if (!isCorrect) {
        selectedBtn.classList.add('incorrect');
        // Add to incorrect list
        if (!appState.incorrectIds.includes(data.originalIndex)) {
            appState.incorrectIds.push(data.originalIndex);
            saveState();
        }
    } else {
        // Remove from incorrect list if answered correctly
        const idx = appState.incorrectIds.indexOf(data.originalIndex);
        if (idx !== -1) {
            appState.incorrectIds.splice(idx, 1);
            saveState();
        }
    }

    showExplanation(data);
}

function showExplanation(data) {
    correctAnswerNumber.textContent = data.answer;
    explanationText.textContent = data.explanation || '解説はありません。';
    sourceText.textContent = data.source || '不明';

    resultBlock.classList.remove('hidden');
    setTimeout(() => {
        resultBlock.classList.add('active');
    }, 10);
    
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function nextQuestion() {
    // If sequential mode, update saved progress
    if (currentMode === 'sequential') {
        appState.sequentialIndex = currentQueueIndex + 1;
        saveState();
    }
    
    currentQueueIndex++;
    loadQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function finishQuiz() {
    questionText.textContent = "すべての問題が完了しました！お疲れ様でした。";
    choicesBlock.innerHTML = '';
    resultBlock.classList.add('hidden');
    progressText.textContent = "完了";
    
    const finishBtn = document.createElement('button');
    finishBtn.textContent = "ホームに戻る";
    finishBtn.className = "next-btn";
    finishBtn.onclick = () => showScreen('home');
    choicesBlock.appendChild(finishBtn);
}

// Event Listeners
modeSequentialBtn.addEventListener('click', () => startQuiz('sequential'));
modeShuffleBtn.addEventListener('click', () => startQuiz('shuffle'));
modeRandom50Btn.addEventListener('click', () => startQuiz('random50'));
modeReviewBtn.addEventListener('click', () => startQuiz('review'));

btnBackHome.addEventListener('click', () => {
    // Save progress if sequential
    if (currentMode === 'sequential') {
        appState.sequentialIndex = currentQueueIndex;
        saveState();
    }
    showScreen('home');
});

btnResetData.addEventListener('click', () => {
    if (confirm('すべての学習履歴（続きからの場所・間違えた問題リスト）をリセットします。よろしいですか？')) {
        appState = { sequentialIndex: 0, incorrectIds: [] };
        saveState();
        updateHomeUI();
        alert('学習データをリセットしました。');
    }
});

nextBtn.addEventListener('click', nextQuestion);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
