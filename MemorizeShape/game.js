class MemorizeTheShapeGame {
  constructor() {
    // Названия фигур и их цвета
    this.shapesColors = {
      triangle: '#FF0000',
      square: '#FF7F00',
      circle: '#FFFF00',
      pentagon: '#00FF00',
      hexagon: '#0000FF',
      star: '#00ffff',
      diamond: '#8B00FF'
    };

    this.shapes = Object.keys(this.shapesColors);

    // Инициализация параметров игры
    this.level = 1;
    this.maxLevel = 10;
    this.score = 0;
    this.bonus = 1;
    this.chances = 3;
    this.timeLeft = 60;

    this.stageElements = [];

    // Кэширование всех важных DOM элементов
    this.elements = {
      memoryField: document.getElementById('memory-field'),
      rememberBtn: document.getElementById('remember-btn'),
      selection: document.getElementById('selection'),
      instruction: document.getElementById('instruction'),
      level: document.getElementById('level'),
      score: document.getElementById('score'),
      bonus: document.getElementById('bonus'),
      chances: document.getElementById('chances'),
      timer: document.getElementById('timer'),
      tutorial: document.getElementById('tutorial'),
      startBtn: document.getElementById('start-btn'),
      backBtn: document.getElementById('back-btn'),
      gameSection: document.getElementById('game'),
      countdownSection: document.getElementById('countdown'),
      countdownNumber: document.getElementById('countdown-number'),
      message: document.getElementById('message'),
      gameOverSection: document.getElementById('game-over'),
      finalScore: document.getElementById('final-score'),
      retryBtn: document.getElementById('retry-btn'),
      exitBtn: document.getElementById('exit-btn'),
    };

    this.removedItems = [];
    this.selectedDivs = new Set();

    this.timerInterval = null;

    this.bindEvents();
  }

  // Назначает обработчики событий для кнопок и элементов интерфейса
  bindEvents() {
    this.elements.startBtn.addEventListener('click', () => {
      this.elements.tutorial.classList.add('hidden');
      this.startCountdown();
    });

    this.elements.backBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });

    this.elements.rememberBtn.addEventListener('click', () => {
      this.startDarkness();
    });

    this.elements.selection.addEventListener('click', e => {
      const target = e.target.closest('.figure');
      if (!target) return;
      this.toggleSelection(target);
    });

    this.elements.retryBtn.addEventListener('click', () => {
      this.elements.gameOverSection.classList.add('hidden');
      this.startGame();
    });

    this.elements.exitBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }

  // Запускает обратный отсчет
  startCountdown() {
    this.elements.countdownSection.classList.remove('hidden');
    let count = 3;
    this.elements.countdownNumber.textContent = count;
    const interval = setInterval(() => {
      count--;
      this.elements.countdownNumber.textContent = count;
      if (count <= 0) {
        clearInterval(interval);
        this.elements.countdownSection.classList.add('hidden');
        this.startGame();
      }
    }, 1000);
  }

  // Запускает новую игру — сбрасывает параметры, подготавливает уровень и стартует таймер
  startGame() {
    this.level = 1;
    this.score = 0;
    this.bonus = 1;
    this.chances = 3;
    this.selectedDivs.clear();
    this.elements.message.textContent = '';
    this.updateStatus();
    this.elements.gameSection.classList.remove('hidden');
    this.elements.gameOverSection.classList.add('hidden');
    this.prepareLevel();
    this.startTimer();
  }

  // Запускает таймер уровня и отслеживает время, по окончании вызывает финальный экран
  startTimer() {
    this.timeLeft = 60;
    this.updateTimer();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimer();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.showFinalResult();
      }
    }, 1000);
  }

  // Обновляет отображение оставшегося времени на странице
  updateTimer() {
    this.elements.timer.textContent = `Время: ${this.timeLeft}`;
  }

  // Обновляет отображение уровня, очков, бонуса и шансов на странице
  updateStatus() {
    this.elements.level.textContent = `Уровень: ${this.level} - ${this.maxLevel}`;
    this.elements.score.textContent = `Очки: ${this.score}`;
    this.elements.bonus.textContent = `Бонус: x${this.bonus} - x${this.maxLevel}`;
    this.elements.chances.textContent = `Шансы: ${this.chances}`;
  }

  // Возвращает настройки текущего уровня — сколько фигур будет показано и сколько удалено
  getLevelConfig(level) {
    switch(level) {
      case 1: return {storedCount: 3, removedCount: 1};
      case 2: return {storedCount: 3, removedCount: 2};
      case 3: return {storedCount: 4, removedCount: 2};
      case 4: return {storedCount: 4, removedCount: 3};
      case 5: return {storedCount: 5, removedCount: 3};
      case 6: return {storedCount: 5, removedCount: 4};
      case 7: return {storedCount: 6, removedCount: 4};
      case 8: return {storedCount: 6, removedCount: 5};
      case 9: return {storedCount: 7, removedCount: 5};
      case 10: return {storedCount: 7, removedCount: 6};
      default: return {storedCount: 3, removedCount: 1};
    }
  }

  // Создаёт DOM элемент с нужной фигурой и цветом
  createFigureDiv(fig) {
    const div = document.createElement('div');
    div.classList.add('figure', fig.shape);
    div.style.backgroundColor = fig.color;
    if (fig.shape === 'triangle') {
      div.style.backgroundColor = 'transparent';
      div.style.width = '0px';
      div.style.height = '0px';
      div.style.borderLeft = '25px solid transparent';
      div.style.borderRight = '25px solid transparent';
      div.style.borderBottom = `50px solid ${fig.color}`;
    }
    if (['star', 'diamond'].includes(fig.shape)) {
      div.style.backgroundColor = '';
    }
    return div;
  }

  // Отображает все фигуры на игровом поле
  renderFieldFigures(figures) {
    this.elements.memoryField.innerHTML = '';
    figures.forEach(fig => {
      const cell = document.createElement('div');
      const figDiv = this.createFigureDiv(fig);
      cell.appendChild(figDiv);
      this.elements.memoryField.appendChild(cell);
    });
  }

  // Подготавливает фигуры для текущего уровня, обновляет интерфейс
  prepareLevel() {
    this.elements.selection.innerHTML = '';
    this.elements.selection.classList.add('hidden');
    this.elements.rememberBtn.classList.remove('hidden');
    this.elements.instruction.textContent = 'Запомните фигуры';
    this.elements.message.textContent = '';
    this.selectedDivs.clear();

    this.levelCfg = this.getLevelConfig(this.level);
    this.stageElements = [];
    const count = this.levelCfg.storedCount;

    let usedShapes = new Set();
    while (this.stageElements.length < count) {
      const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
      if (!usedShapes.has(shape)) {
        usedShapes.add(shape);
        this.stageElements.push({shape, color: this.shapesColors[shape]});
      }
    }
    this.renderFieldFigures(this.stageElements);
  }

  // Удаляет выбранные фигуры (заменяет их на пустые контуры) и подготавливает выбор
  startDarkness() {
    this.elements.rememberBtn.classList.add('hidden');
    this.elements.instruction.textContent = '...';
    this.elements.message.textContent = '';

    this.removedItems = this.pickRemovedItems();

    this.removedItems.forEach(idx => {
      const cell = this.elements.memoryField.children[idx];
      if (cell) {
        cell.innerHTML = '';
        const placeholder = document.createElement('div');
        placeholder.classList.add('figure', 'missing');
        cell.appendChild(placeholder);
      }
    });

    this.prepareSelection();
  }

  // Возвращает индекс DOM элемента фигуры в игровом поле
  getFigureIndexInStage(cell) {
    const cells = Array.from(this.elements.memoryField.children);
    return cells.indexOf(cell);
  }

  // Случайным образом выбирает какие фигуры будут удалены для текущего уровня
  pickRemovedItems() {
    const count = this.levelCfg.removedCount;
    const total = this.stageElements.length;
    const indices = new Set();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * total));
    }
    return Array.from(indices);
  }

  // Формирует варианты выбора с правильными и дополнительными фигурами, отображает интерфей
  prepareSelection() {
    this.elements.selection.innerHTML = '';
    this.elements.selection.classList.remove('hidden');
    this.selectedDivs.clear();

    const neededToSelect = this.removedItems.length;
    const totalOptions = neededToSelect + 2;

    let options = this.removedItems.map(i => this.stageElements[i]);

    const usedShapes = new Set(this.stageElements.map(f => f.shape));

    while (options.length < totalOptions) {
      let fig;
      do {
        const sh = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        if (!usedShapes.has(sh) && !options.some(o => o.shape === sh)) {
          fig = {shape: sh, color: this.shapesColors[sh]};
        }
      } while (!fig);
      options.push(fig);
    }

    options = this.shuffleArray(options);

    options.forEach(fig => {
      const div = this.createFigureDiv(fig);
      div.classList.remove('selected','correct','incorrect');
      div.tabIndex = 0;
      div.setAttribute('role', 'button');
      div.setAttribute('aria-pressed', 'false');
      this.elements.selection.appendChild(div);
    });

    this.elements.message.style.color = '#f1c40f';
    this.elements.message.textContent = 'Выберите фигуры, которые пропали';
  }

  // Переключает выделение выбранной пользователем фигуры
  toggleSelection(item) {
    if (this.selectedDivs.has(item)) {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed','false');
      this.selectedDivs.delete(item);
    } else {
      if (this.selectedDivs.size >= this.removedItems.length) return;
      item.classList.add('selected');
      item.setAttribute('aria-pressed','true');
      this.selectedDivs.add(item);
    }

    if (this.selectedDivs.size === this.removedItems.length) {
      this.checkAnswers();
    }
  }

  // Проверяет выбранные фигуры на правильность, обновляет очки, уровень и шансы, запускает следующий этап или финал
  checkAnswers() {
    const removedFigures = this.removedItems.map(idx => this.stageElements[idx]);

    const selectedFigures = Array.from(this.selectedDivs).map(div => {
      const classes = div.classList;
      const shape = this.shapes.find(s => classes.contains(s));
      const color = this.shapesColors[shape];
      return { shape, color };
    });

    let correctCount = 0;
    selectedFigures.forEach(sel => {
      const foundIndex = removedFigures.findIndex(rm => rm.shape === sel.shape && rm.color === sel.color);
      if (foundIndex !== -1) {
        correctCount++;
        removedFigures.splice(foundIndex, 1);
      }
    });

    if (correctCount === this.removedItems.length) {
      this.score += 10 * this.bonus;
      this.bonus = Math.min(this.bonus + 1, this.maxLevel);
      this.level++;
      this.elements.message.style.color = '#2ecc71';
      this.elements.message.textContent = 'Правильно! Переходим на следующий уровень.';
      if (this.level > this.maxLevel) {
        setTimeout(() => this.showFinalResult(), 1500);
        return;
      }
      this.resetForNextLevel();
    } else {
      this.chances--;
      this.elements.message.style.color = '#e74c3c';
      this.elements.message.textContent = `Неправильно. Осталось шансов: ${this.chances}`;
      if (this.chances <= 0) {
        setTimeout(() => this.showFinalResult(), 1500);
        return;
      }
      this.resetForNextLevel();
    }
    this.updateStatus();
  }

  // Сбрасывает выбор и интерфейс для перехода к следующему уровню
  resetForNextLevel() {
    setTimeout(() => {
      this.selectedDivs.clear();
      this.elements.selection.classList.add('hidden');
      this.elements.rememberBtn.classList.remove('hidden');
      this.elements.instruction.textContent = 'Запомните фигуры';
      this.elements.message.textContent = '';
      this.prepareLevel();
    }, 1500);
  }

  // Показывает экран с итоговым результатом игры, скрывает игровой экран
  showFinalResult() {
    clearInterval(this.timerInterval);
    this.elements.gameSection.classList.add('hidden');
    this.elements.gameOverSection.classList.remove('hidden');
    this.elements.finalScore.textContent = `Ваш счет: ${this.score}`;
  }

  // Перемешивает массив — используется для случайного порядка опций выбора
  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

// Инициализация игры после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
  new MemorizeTheShapeGame();
});