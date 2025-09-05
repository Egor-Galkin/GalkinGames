class FindTheNumberGame {
    constructor() {
        // Массивы цветов и анимаций для ячеек
        this.colors = ['#00bfff', '#ff69b4', '#ff8c00', '#32cd32', '#8a2be2', '#222'];
        this.animations = ['shake', 'pulse', 'zoom'];

        // Инициализация параметров игры
        this.timerDuration = 60;
        this.currentLevel = 1;
        this.score = 0;
        this.bonus = 1;
        this.timeLeft = this.timerDuration;
        this.intervalId = null;
        this.correctAnswers = 0;
        this.totalAnswers = 0;

        // Кэширование всех важных DOM элементов
        this.elements = {
            timer: document.getElementById('timer'),
            level: document.getElementById('level'),
            score: document.getElementById('score'),
            bonus: document.getElementById('bonus'),
            targetNumber: document.getElementById('target-number'),
            grid: document.getElementById('grid'),
            tutorial: document.getElementById('tutorial'),
            startBtn: document.getElementById('start-btn'),
            backBtn: document.getElementById('back-btn'),
            gameSection: document.getElementById('game'),
            countdownSection: document.getElementById('countdown'),
            countdownNumber: document.getElementById('countdown-number'),
            gameOverSection: document.getElementById('game-over'),
            finalScore: document.getElementById('final-score'),
            correctStat: document.getElementById('correct-stat'),
            retryBtn: document.getElementById('retry-btn'),
            exitBtn: document.getElementById('exit-btn')
        };

        // Конфигурация уровней: размер сетки, диапозоны чисел, наличие анимаций
        this.levelsConfig = [
            { rows: 2, cols: 3, min: 1, max: 99, digits: [1, 2] },
            { rows: 2, cols: 3, min: 10, max: 99, digits: [2] },
            { rows: 2, cols: 3, min: 100, max: 999, digits: [3], anim: true },
            { rows: 3, cols: 4, min: 100, max: 999, digits: [3], anim: true },
            { rows: 4, cols: 4, min: 1000, max: 9999, digits: [4], anim: true },
            { rows: 5, cols: 5, min: 1000, max: 9999, digits: [4], anim: true }
        ];

        this.bindEvents();
    }

    // Привязывает обработчики событий для кнопок и игровой сетки
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => {
            this.elements.tutorial.classList.add('hidden');
            this.startCountdown();
        });

        this.elements.backBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });

        this.elements.grid.addEventListener('click', (e) => {
            if (!e.target.classList.contains('cell')) return;
            this.handleCellClick(e.target);
        });

        this.elements.retryBtn.addEventListener('click', () => {
            this.elements.gameOverSection.classList.add('hidden');
            this.startGame();
        });
        
        this.elements.exitBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }

    // Запускает обратный отсчёт
    startCountdown() {
        this.elements.countdownSection.classList.remove('hidden');
        let count = 3;
        this.elements.countdownNumber.textContent = count;
        const interval = setInterval(() => {
            count--;
            this.elements.countdownNumber.textContent = count;
            if (count === 0) {
                clearInterval(interval);
                this.elements.countdownSection.classList.add('hidden');
                this.startGame();
            }
        }, 1000);
    }

    // Сбрасывает параметры и запускает игру
    startGame() {
        this.timeLeft = this.timerDuration;
        this.currentLevel = 1;
        this.score = 0;
        this.bonus = 1;
        this.updateStatus();
        this.startTimer();
        this.setupLevel();
        this.elements.gameSection.classList.remove('hidden');
    }

    // Запускает таймер игры
    startTimer() {
        this.elements.timer.textContent = `Время: ${this.timeLeft}`;
        this.intervalId = setInterval(() => {
            this.timeLeft--;
            this.elements.timer.textContent = `Время: ${this.timeLeft}`;
            if (this.timeLeft <= 0) {
                clearInterval(this.intervalId);
                this.gameOver();
            }
        }, 1000);
    }

    // Останавливает таймер, скрывает игру, показывает экран финала с результатами
    gameOver() {
        clearInterval(this.intervalId);
        this.elements.gameSection.classList.add('hidden');
        this.elements.gameOverSection.classList.remove('hidden');
        this.elements.finalScore.textContent = `Ваш счет: ${this.score}`;
        this.elements.correctStat.textContent = `Верные ответы: ${this.correctAnswers} из ${this.totalAnswers}`;
    }

    // Обновляет в интерфейсе отображение текущего уровня, очков и бонуса
    updateStatus() {
        this.elements.level.textContent = `Уровень: ${this.currentLevel} - 9`;
        this.elements.score.textContent = `Очки: ${this.score}`;
        this.elements.bonus.textContent = `Бонус: x${this.bonus} - x5`;
    }

    // Возвращает настройки для данного уровня
    getLevelConfig(level) {
        if (level <= 2) return this.levelsConfig[0];
        if (level === 3) return this.levelsConfig[2];
        if (level === 4 || level === 5) return this.levelsConfig[3];
        if (level === 6 || level === 7) return this.levelsConfig[4];
        if (level === 8 || level === 9) return this.levelsConfig[5];
        return this.levelsConfig[0];
    }

    // Создаёт и отображает игровую сетку с числами и анимациями для текущего уровня
    setupLevel() {
        const config = this.getLevelConfig(this.currentLevel);

        const rows = config.rows;
        const cols = config.cols;
        const minNum = config.min;
        const maxNum = config.max;

        const totalCells = rows * cols;

        let numbers = new Set();
        while (numbers.size < totalCells - 1) {
            numbers.add(this.randomInt(minNum, maxNum));
        }

        const targetCellIndex = this.randomInt(0, totalCells - 1);

        const numbersArray = Array.from(numbers);
        numbersArray.splice(targetCellIndex, 0, 0);

        numbersArray[targetCellIndex] = this.randomInt(minNum, maxNum);
        this.targetNumber = numbersArray[targetCellIndex];
        this.elements.targetNumber.textContent = `Найдите число: ${this.targetNumber}`;

        this.elements.grid.innerHTML = '';
        this.elements.grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.elements.grid.style.gridTemplateRows = `repeat(${rows}, 80px)`;

        numbersArray.forEach((num) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const textWrapper = document.createElement('div');
            textWrapper.classList.add('text-wrapper');
            textWrapper.textContent = num;
            cell.appendChild(textWrapper);

            cell.style.backgroundColor = this.colors[this.randomInt(0, this.colors.length - 1)];

            if (config.anim) {
                const animCls = this.animations[this.randomInt(0, this.animations.length - 1)];
                if (animCls === 'zoom' || animCls === 'pulse') {
                    cell.classList.add(animCls);
                } else if (animCls === 'shake') {
                    textWrapper.classList.add(animCls);
                }
            }

            this.elements.grid.appendChild(cell);
        });
    }

    // Обрабатывает клик по ячейке: проверяет число, обновляет счёт, уровень, бонусы
    handleCellClick(cell) {
        const selectedNum = parseInt(cell.querySelector('.text-wrapper').textContent);
        this.totalAnswers++;
        if (selectedNum === this.targetNumber) {
            this.correctAnswers++;
            this.score += 10 * this.bonus;
            this.currentLevel = Math.min(this.currentLevel + 1, 9);
            this.bonus = Math.min(this.bonus + 1, 5);
        } else {
            this.currentLevel = Math.max(this.currentLevel - 1, 1);
            this.bonus = Math.max(this.bonus - 1, 1);
            this.score = Math.max(this.score - 10, 0);
        }
        this.updateStatus();
        this.setupLevel();
    }

    // Генерирует случайное целое число в диапазоне [min, max]
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// Инициализация игры после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    new FindTheNumberGame();
});