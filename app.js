// Math Practice App
(function () {
    'use strict';

    // State
    const state = {
        mode: null,
        config: {
            multipliers: [2, 3, 4, 5, 6, 7, 8, 9, 10],
            operators: ['>', '<'],
            questionCount: 10
        },
        session: {
            questions: [],
            currentIndex: 0,
            correct: 0,
            answered: false
        }
    };

    // DOM Elements
    const panels = {
        modeSelection: document.getElementById('mode-selection'),
        multConfig: document.getElementById('mult-config'),
        ineqConfig: document.getElementById('ineq-config'),
        practiceSession: document.getElementById('practice-session'),
        results: document.getElementById('results')
    };

    const elements = {
        multiplierOptions: document.getElementById('multiplier-options'),
        operatorOptions: document.getElementById('operator-options'),
        multQuestionCount: document.getElementById('mult-question-count'),
        ineqQuestionCount: document.getElementById('ineq-question-count'),
        questionCounter: document.getElementById('question-counter'),
        progressFill: document.getElementById('progress-fill'),
        scoreCorrect: document.getElementById('score-correct'),
        questionSymbolic: document.getElementById('question-symbolic'),
        questionTextual: document.getElementById('question-textual'),
        answersContainer: document.getElementById('answers-container'),
        finalScore: document.getElementById('final-score'),
        accuracyPercent: document.getElementById('accuracy-percent')
    };

    // Number to words mapping
    const numberWords = {
        0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
        5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
        10: 'ten', 11: 'eleven', 12: 'twelve'
    };

    const operatorWords = {
        '>': 'greater than',
        '<': 'less than',
        '≥': 'greater than or equal to',
        '≤': 'less than or equal to'
    };

    // Initialize
    function init() {
        generateMultiplierCheckboxes();
        bindEvents();
    }

    // Generate multiplier checkboxes
    function generateMultiplierCheckboxes() {
        const container = elements.multiplierOptions;
        container.innerHTML = '';

        for (let i = 2; i <= 10; i++) {
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" value="${i}" checked>
                <span class="checkbox-label">×${i}</span>
            `;
            container.appendChild(label);
        }
    }

    // Bind all events
    function bindEvents() {
        // Mode selection
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                state.mode = mode;
                showPanel(mode === 'multiplication' ? 'multConfig' : 'ineqConfig');
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn[data-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                showPanel('modeSelection');
            });
        });

        // Number input buttons
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const input = document.getElementById(targetId);
                const step = parseInt(input.step) || 5;
                const min = parseInt(input.min) || 5;
                const max = parseInt(input.max) || 50;
                let value = parseInt(input.value);

                if (btn.classList.contains('minus')) {
                    value = Math.max(min, value - step);
                } else {
                    value = Math.min(max, value + step);
                }

                input.value = value;
            });
        });

        // Start buttons
        document.getElementById('start-multiplication').addEventListener('click', () => {
            startSession('multiplication');
        });

        document.getElementById('start-inequalities').addEventListener('click', () => {
            startSession('inequalities');
        });

        // Exit session
        document.getElementById('exit-session').addEventListener('click', () => {
            showPanel('modeSelection');
        });

        // Results buttons
        document.getElementById('retry-session').addEventListener('click', () => {
            startSession(state.mode);
        });

        document.getElementById('change-mode').addEventListener('click', () => {
            showPanel('modeSelection');
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeydown);
    }

    // Show panel
    function showPanel(panelKey) {
        Object.values(panels).forEach(panel => panel.classList.remove('active'));
        panels[panelKey].classList.add('active');
    }

    // Handle keyboard input
    function handleKeydown(e) {
        // Escape to go back
        if (e.key === 'Escape') {
            if (panels.practiceSession.classList.contains('active')) {
                showPanel('modeSelection');
            } else if (panels.multConfig.classList.contains('active') ||
                panels.ineqConfig.classList.contains('active')) {
                showPanel('modeSelection');
            } else if (panels.results.classList.contains('active')) {
                showPanel('modeSelection');
            }
            return;
        }

        // Number keys for answers
        if (panels.practiceSession.classList.contains('active') && !state.session.answered) {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 4) {
                const btn = document.querySelector(`.answer-btn[data-key="${key}"]`);
                if (btn) {
                    btn.click();
                }
            }
        }
    }

    // Start practice session
    function startSession(mode) {
        state.mode = mode;

        // Get config
        if (mode === 'multiplication') {
            const checkboxes = elements.multiplierOptions.querySelectorAll('input:checked');
            state.config.multipliers = Array.from(checkboxes).map(cb => parseInt(cb.value));
            state.config.questionCount = parseInt(elements.multQuestionCount.value);

            if (state.config.multipliers.length === 0) {
                alert('Please select at least one multiplier');
                return;
            }
        } else {
            const checkboxes = elements.operatorOptions.querySelectorAll('input:checked');
            state.config.operators = Array.from(checkboxes).map(cb => cb.value);
            state.config.questionCount = parseInt(elements.ineqQuestionCount.value);

            if (state.config.operators.length === 0) {
                alert('Please select at least one operator');
                return;
            }
        }

        // Reset session
        state.session = {
            questions: generateQuestions(mode),
            currentIndex: 0,
            correct: 0,
            answered: false
        };

        showPanel('practiceSession');
        displayQuestion();
    }

    // Generate questions
    function generateQuestions(mode) {
        const questions = [];
        const count = state.config.questionCount;

        if (mode === 'multiplication') {
            const usedCombos = new Set();
            let attempts = 0;
            const maxAttempts = count * 10;

            while (questions.length < count && attempts < maxAttempts) {
                attempts++;
                const multiplier = state.config.multipliers[
                    Math.floor(Math.random() * state.config.multipliers.length)
                ];
                const factor = Math.floor(Math.random() * 9) + 2; // 2-10
                const comboKey = `${factor}x${multiplier}`;

                if (usedCombos.has(comboKey)) continue;
                usedCombos.add(comboKey);

                const answer = multiplier * factor;

                questions.push({
                    type: 'multiplication',
                    symbolic: `${factor} × ${multiplier}`,
                    textual: `${numberWords[factor] || factor} times ${numberWords[multiplier] || multiplier}`,
                    answer: answer,
                    options: generateOptions(answer)
                });
            }
        } else {
            for (let i = 0; i < count; i++) {
                const operator = state.config.operators[
                    Math.floor(Math.random() * state.config.operators.length)
                ];
                const baseNum = Math.floor(Math.random() * 20) - 10; // -10 to 9

                questions.push(generateInequalityQuestion(operator, baseNum));
            }
        }

        return questions;
    }

    // Generate inequality question
    function generateInequalityQuestion(operator, baseNum) {
        // Generate candidate answers
        const candidates = [];
        for (let i = -15; i <= 15; i++) {
            candidates.push(i);
        }

        // Find correct answers based on operator
        let correctAnswers = [];
        switch (operator) {
            case '>':
                correctAnswers = candidates.filter(n => n > baseNum);
                break;
            case '<':
                correctAnswers = candidates.filter(n => n < baseNum);
                break;
            case '≥':
                correctAnswers = candidates.filter(n => n >= baseNum);
                break;
            case '≤':
                correctAnswers = candidates.filter(n => n <= baseNum);
                break;
        }

        // Pick one correct answer
        const correctAnswer = correctAnswers[Math.floor(Math.random() * correctAnswers.length)];

        // Generate wrong answers
        const wrongCandidates = candidates.filter(n => !correctAnswers.includes(n));
        const shuffledWrong = wrongCandidates.sort(() => Math.random() - 0.5);
        const wrongAnswers = shuffledWrong.slice(0, 3);

        // Create options
        const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        return {
            type: 'inequality',
            symbolic: `x ${operator} ${baseNum}`,
            textual: `x is ${operatorWords[operator]} ${baseNum}`,
            answer: correctAnswer,
            options: options
        };
    }

    // Generate answer options for multiplication
    function generateOptions(correctAnswer) {
        const options = new Set([correctAnswer]);

        // Add nearby wrong answers
        const offsets = [-10, -5, -2, -1, 1, 2, 5, 10];
        const shuffled = offsets.sort(() => Math.random() - 0.5);

        for (const offset of shuffled) {
            if (options.size >= 4) break;
            const wrong = correctAnswer + offset;
            if (wrong > 0 && wrong !== correctAnswer) {
                options.add(wrong);
            }
        }

        // Fill with random if needed
        while (options.size < 4) {
            const random = Math.floor(Math.random() * 100) + 4;
            if (random !== correctAnswer) {
                options.add(random);
            }
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    // Display current question
    function displayQuestion() {
        const question = state.session.questions[state.session.currentIndex];
        const total = state.session.questions.length;
        const current = state.session.currentIndex + 1;

        // Update header
        elements.questionCounter.textContent = `${current} / ${total}`;
        elements.progressFill.style.width = `${((current - 1) / total) * 100}%`;
        elements.scoreCorrect.textContent = state.session.correct;

        // Display question
        elements.questionSymbolic.textContent = question.symbolic;
        elements.questionTextual.textContent = question.textual;

        // Generate answer buttons
        elements.answersContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.dataset.key = index + 1;
            btn.textContent = option;
            btn.addEventListener('click', () => handleAnswer(option, btn));
            elements.answersContainer.appendChild(btn);
        });

        state.session.answered = false;
    }

    // Handle answer selection
    function handleAnswer(selectedAnswer, selectedBtn) {
        if (state.session.answered) return;
        state.session.answered = true;

        const question = state.session.questions[state.session.currentIndex];
        const isCorrect = selectedAnswer === question.answer;

        if (isCorrect) {
            state.session.correct++;
            selectedBtn.classList.add('correct');
        } else {
            selectedBtn.classList.add('incorrect');
            // Show correct answer
            const buttons = elements.answersContainer.querySelectorAll('.answer-btn');
            buttons.forEach(btn => {
                if (parseInt(btn.textContent) === question.answer) {
                    btn.classList.add('correct');
                }
            });
        }

        // Disable all buttons
        const buttons = elements.answersContainer.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.classList.add('disabled'));

        // Update progress
        elements.scoreCorrect.textContent = state.session.correct;

        // Move to next question or show results
        setTimeout(() => {
            state.session.currentIndex++;
            if (state.session.currentIndex < state.session.questions.length) {
                displayQuestion();
            } else {
                showResults();
            }
        }, 800);
    }

    // Show results
    function showResults() {
        const total = state.session.questions.length;
        const correct = state.session.correct;
        const accuracy = Math.round((correct / total) * 100);

        elements.finalScore.textContent = `${correct}/${total}`;
        elements.accuracyPercent.textContent = `${accuracy}%`;
        elements.progressFill.style.width = '100%';

        showPanel('results');
    }

    // Start the app
    init();
})();
