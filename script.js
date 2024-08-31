const rows = 10;
const cols = 10;
const numBombs = 10;
const board = document.getElementById('game-board');
const status = document.getElementById('status');
const retryBtn = document.getElementById('retry-btn');
const prevLevelBtn = document.getElementById('prev-level-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const completionMessage = document.getElementById('completion-message');
const summaryPopup = document.getElementById('summary-popup');
const summaryContent = document.getElementById('summary-content');
const restartBtn = document.getElementById('restart-btn');
const closePopupBtn = document.getElementById('close-popup-btn');
const cells = [];
const bombNames = [
    '宝玉', '黛玉', '宝钗', '姥姥', '平儿', '探春', '晴雯', '凤姐'
];
let bombs = [];
let currentLevel = 0; // 当前关卡
let cluesFound = 0; // 当前关卡找到的线索的数量
let clickCount = 0; // 点击次数
let startTime; // 关卡开始时间
let totalClickCounts = []; // 所有关卡的点击次数
let levelStartTimes = []; // 记录每一关的开始时间
let levelEndTimes = []; // 记录每一关的结束时间
let levelTimerInterval; // 关卡计时器间隔

function createBoard() {
    board.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    for (let row = 0; row < rows; row++) {
        cells[row] = [];
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => {
                clickCount++;
                revealCell(row, col);
            });
            board.appendChild(cell);
            cells[row][col] = cell;
        }
    }
    placeBombs();
    updateStatus();
    retryBtn.style.display = 'inline-block';
    prevLevelBtn.style.display = currentLevel > 0 ? 'inline-block' : 'none';
    nextLevelBtn.style.display = 'none';
    completionMessage.style.display = 'none';
    summaryPopup.style.display = 'none';
    startTime = new Date(); // 记录关卡开始时间
    levelStartTimes[currentLevel] = startTime; // 记录当前关卡的开始时间
    clickCount = 0; // 初始化点击次数
    startLevelTimer(); // 开始关卡计时
}

function startLevelTimer() {
    clearInterval(levelTimerInterval); // 清除任何现有的计时器
    const timerElement = document.getElementById('timer');
    let elapsedTime = 0; // 已经过的时间（秒）

    levelTimerInterval = setInterval(() => {
        elapsedTime++;
        timerElement.textContent = `时间：${elapsedTime}秒`; // 实时更新显示的时间
    }, 1000);
}

function stopLevelTimer() {
    clearInterval(levelTimerInterval); // 停止计时器
}

function placeBombs() {
    bombs = [];
    cluesFound = 0; // 重置找到的线索的数量
    let bombsPlaced = 0;
    while (bombsPlaced < numBombs) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (!bombs.some(bomb => bomb.row === row && bomb.col === col)) {
            bombs.push({ row, col, name: bombNames[currentLevel] });
            bombsPlaced++;
        }
    }
}

function revealCell(row, col) {
    const cell = cells[row][col];
    if (cell.classList.contains('revealed')) return;
    cell.classList.add('revealed');
    const bomb = bombs.find(b => b.row === row && b.col === col);
    if (bomb) {
        cell.classList.add('bomb');
        cell.textContent = bomb.name; // 显示雷的名称
        cluesFound++;
        if (cluesFound === numBombs) {
            showCompletionMessage();
        }
    } else {
        const adjacentBombs = countAdjacentBombs(row, col);
        if (adjacentBombs > 0) {
            cell.textContent = adjacentBombs;
        } else {
            cell.textContent = '';
            revealAdjacentCells(row, col);
        }
    }
    updateStatus();
}

function countAdjacentBombs(row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    let count = 0;
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            if (bombs.some(b => b.row === newRow && b.col === newCol)) {
                count++;
            }
        }
    }
    return count;
}

function revealAdjacentCells(row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            revealCell(newRow, newCol);
        }
    }
}

function updateStatus() {
    status.textContent = `当前关卡：${currentLevel + 1}/8 - 发现线索：${cluesFound}/${numBombs} - 点击次数：${clickCount}`;
}

function showCompletionMessage() {
    const endTime = new Date();
    stopLevelTimer(); // 停止计时器
    const timeTaken = Math.floor((endTime - levelStartTimes[currentLevel]) / 1000); // 计算用时（秒）
    completionMessage.innerHTML = `恭喜！关卡 ${currentLevel + 1} 完成！<br>完成时间：${timeTaken}秒<br>点击次数：${clickCount}`;
    completionMessage.style.display = 'block';
    levelEndTimes[currentLevel] = endTime; // 记录关卡结束时间
    totalClickCounts[currentLevel] = clickCount; // 保存每关的点击次数
    nextLevelBtn.style.display = 'inline-block';
}

function nextLevel() {
    currentLevel++;
    if (currentLevel < bombNames.length) {
        resetGame();
    } else {
        showSummaryPopup(); // 显示弹窗
    }
}

function prevLevel() {
    if (currentLevel > 0) {
        currentLevel--;
        resetGame();
    }
}

function resetGame() {
    board.innerHTML = '';
    createBoard();
}

function showSummaryPopup() {
    const totalClicks = totalClickCounts.reduce((a, b) => a + b, 0);
    const totalTime = levelEndTimes.reduce((acc, endTime, index) => {
        const startTime = levelStartTimes[index];
        return acc + Math.floor((endTime - startTime) / 1000);
    }, 0);
    summaryContent.innerHTML = `
        <h3>关卡完成情况</h3>
        ${bombNames.map((name, index) => {
            const timeTaken = levelEndTimes[index] ? Math.floor((levelEndTimes[index] - levelStartTimes[index]) / 1000) : 0;
            return `<p>第 ${index + 1} 关 - 点击次数：${totalClickCounts[index] || 0} - 用时：${timeTaken}秒</p>`;
        }).join('')}
        <h3>总点击次数：${totalClicks}次</h3>
        <h3>总用时：${totalTime}秒</h3>
    `;
    summaryPopup.style.display = 'flex'; // 显示弹窗
}

function restartGame() {
    currentLevel = 0;
    totalClickCounts = [];
    levelStartTimes = [];
    levelEndTimes = [];
    summaryPopup.style.display = 'none';
    resetGame();
}

// 绑定按钮事件
retryBtn.addEventListener('click', resetGame);
prevLevelBtn.addEventListener('click', prevLevel);
nextLevelBtn.addEventListener('click', nextLevel);
restartBtn.addEventListener('click', restartGame);
closePopupBtn.addEventListener('click', () => summaryPopup.style.display = 'none');

// 初始化游戏
createBoard();
