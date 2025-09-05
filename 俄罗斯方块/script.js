// 获取画布和上下文
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

// 游戏设置
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// 游戏状态
let board = createBoard();
let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let lines = 0;
let dropInterval = 1000; // 初始下落间隔（毫秒）
let lastDropTime = 0;

// 排行榜元素
const leaderboardList = document.getElementById('leaderboard-list');

// 方块形状
const SHAPES = [
    // I
    [[1, 1, 1, 1]],
    
    // J
    [[1, 0, 0],
     [1, 1, 1]],
    
    // L
    [[0, 0, 1],
     [1, 1, 1]],
    
    // O
    [[1, 1],
     [1, 1]],
    
    // S
    [[0, 1, 1],
     [1, 1, 0]],
    
    // T
    [[0, 1, 0],
     [1, 1, 1]],
    
    // Z
    [[1, 1, 0],
     [0, 1, 1]]
];

// 方块颜色
const COLORS = [
    '#00FFFF', // I - 青色
    '#0000FF', // J - 蓝色
    '#FF7F00', // L - 橙色
    '#FFFF00', // O - 黄色
    '#00FF00', // S - 绿色
    '#800080', // T - 紫色
    '#FF0000'  // Z - 红色
];

// 当前方块
let currentPiece = null;

// 创建游戏板
function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// 创建新方块
function createPiece() {
    const typeId = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[typeId],
        color: COLORS[typeId],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[typeId][0].length / 2),
        y: 0
    };
}

// 绘制方块
function drawBlock(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // 绘制方块边框
    context.strokeStyle = '#333';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 绘制游戏板
function drawBoard() {
    // 清空画布
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制已固定的方块
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
    
    // 绘制当前方块
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            }
        }
    }
}

// 碰撞检测
function collision(piece, board, moveX = 0, moveY = 0) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + moveX;
                const newY = piece.y + y + moveY;
                
                // 检查边界
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                // 检查与其他方块的碰撞
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 合并方块到游戏板
function merge(piece, board) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const boardY = piece.y + y;
                const boardX = piece.x + x;
                
                if (boardY >= 0) {
                    board[boardY][boardX] = piece.color;
                }
            }
        }
    }
}

// 旋转方块
function rotate(piece) {
    // 创建旋转后的形状
    const rotated = [];
    for (let i = 0; i < piece.shape[0].length; i++) {
        rotated.push([]);
        for (let j = piece.shape.length - 1; j >= 0; j--) {
            rotated[i].push(piece.shape[j][i]);
        }
    }
    
    // 创建旋转后的方块
    const rotatedPiece = {
        ...piece,
        shape: rotated
    };
    
    // 检查旋转后是否碰撞
    if (!collision(rotatedPiece, board)) {
        return rotatedPiece;
    }
    
    // 尝试墙踢（wall kick）
    for (let kick of [-1, 1, -2, 2]) {
        const kickedPiece = {
            ...rotatedPiece,
            x: piece.x + kick
        };
        
        if (!collision(kickedPiece, board)) {
            return kickedPiece;
        }
    }
    
    // 如果旋转后碰撞，返回原始方块
    return piece;
}

// 清除完整的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // 移除该行
            board.splice(y, 1);
            // 在顶部添加新的空行
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            // 因为移除了一行，所以需要重新检查当前行
            y++;
        }
    }
    
    if (linesCleared > 0) {
        // 更新分数
        lines += linesCleared;
        score += linesCleared * 100 * level;
        
        // 每10行升一级
        level = Math.floor(lines / 10) + 1;
        
        // 更新下落速度
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        // 更新显示
        updateScore();
    }
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    
    // 将分数添加到排行榜
    addScoreToLeaderboard(score);
    
    alert(`游戏结束！\n最终分数: ${score}\n等级: ${level}\n清除行数: ${lines}`);
}

// 从localStorage加载排行榜
function loadLeaderboard() {
    const leaderboard = localStorage.getItem('tetris-leaderboard');
    if (leaderboard) {
        return JSON.parse(leaderboard);
    }
    return [];
}

// 保存排行榜到localStorage
function saveLeaderboard(scores) {
    localStorage.setItem('tetris-leaderboard', JSON.stringify(scores));
}

// 添加分数到排行榜
function addScoreToLeaderboard(newScore) {
    const scores = loadLeaderboard();
    
    // 添加新分数
    scores.push(newScore);
    
    // 按分数降序排序
    scores.sort((a, b) => b - a);
    
    // 只保留前10个最高分
    if (scores.length > 10) {
        scores.splice(10);
    }
    
    // 保存更新后的排行榜
    saveLeaderboard(scores);
    
    // 更新显示
    updateLeaderboardDisplay();
}

// 更新排行榜显示
function updateLeaderboardDisplay() {
    const scores = loadLeaderboard();
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-item">暂无记录</div>';
        return;
    }
    
    leaderboardList.innerHTML = '';
    
    scores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span>${index + 1}. </span>
            <span>${score}</span>
        `;
        leaderboardList.appendChild(item);
    });
}

// 移动方块
function movePiece(direction) {
    if (!gameRunning || gamePaused || !currentPiece) return;
    
    let moveX = 0;
    let moveY = 0;
    
    switch (direction) {
        case 'left':
            moveX = -1;
            break;
        case 'right':
            moveX = 1;
            break;
        case 'down':
            moveY = 1;
            break;
    }
    
    if (!collision(currentPiece, board, moveX, moveY)) {
        currentPiece.x += moveX;
        currentPiece.y += moveY;
        drawBoard();
        return true;
    }
    
    return false;
}

// 硬降落（直接落到底部）
function hardDrop() {
    if (!gameRunning || gamePaused || !currentPiece) return;
    
    while (movePiece('down')) {
        // 继续下落直到碰撞
    }
    lockPiece();
}

// 锁定方块
function lockPiece() {
    merge(currentPiece, board);
    clearLines();
    currentPiece = createPiece();
    
    // 检查游戏是否结束
    if (collision(currentPiece, board)) {
        gameOver();
    }
    
    drawBoard();
}

// 游戏循环
function gameLoop(time = 0) {
    if (!gameRunning) return;
    
    if (!gamePaused) {
        // 自动下落
        if (time - lastDropTime > dropInterval) {
            if (!movePiece('down')) {
                lockPiece();
            }
            lastDropTime = time;
        }
        
        drawBoard();
    }
    
    requestAnimationFrame(gameLoop);
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    board = createBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    
    // 更新分数显示
    updateScore();
    
    // 创建第一个方块
    currentPiece = createPiece();
    
    // 设置游戏状态
    gameRunning = true;
    gamePaused = false;
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? '继续' : '暂停';
}

// 键盘控制
document.addEventListener('keydown', event => {
    // 阻止方向键和空格键的默认行为，防止页面滚动
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
    
    if (!gameRunning || gamePaused) return;
    
    switch (event.key) {
        case 'ArrowLeft':
            movePiece('left');
            break;
        case 'ArrowRight':
            movePiece('right');
            break;
        case 'ArrowDown':
            movePiece('down');
            break;
        case 'ArrowUp':
            currentPiece = rotate(currentPiece);
            drawBoard();
            break;
        case ' ':
            hardDrop();
            break;
    }
});

// 按钮事件
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);

// 初始绘制
drawBoard();

// 如果排行榜为空，添加一些模拟数据用于测试
function addMockScoresIfEmpty() {
    const scores = loadLeaderboard();
    if (scores.length === 0) {
        const mockScores = [15000, 12500, 10000, 8500, 7000, 6000, 5000, 4000, 3000, 2000];
        saveLeaderboard(mockScores);
    }
}

// 初始化排行榜
try {
    addMockScoresIfEmpty();
    updateLeaderboardDisplay();
} catch (error) {
    console.error('加载排行榜时出错:', error);
    leaderboardList.innerHTML = '<div class="leaderboard-item">加载失败</div>';
}