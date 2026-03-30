const buttonColors = ["red", "yellow", "green", "purple"];
let gamePattern = [];
let userClickedPattern = [];
let started = false;
let level = 0;
let score = 0;
let soundEnabled = true;
let scoreHistory = []; 
let currentPlayerName = "Guest"; 
let currentPlayerID = "000"; 

// --- Global Mode Variables ---
let currentMode = 'normal'; 
let sequenceSpeed = 700;    
let flashTime = 200;        

// Load sounds
const sounds = {
  red: new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"),
  yellow: new Audio("https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg"),
  green: new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg"),
  purple: new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"),
  wrong: new Audio("https://actions.google.com/sounds/v1/cartoon/wrong.ogg") 
};

// --- Page Navigation & User Functions ---
const pages = {
    landing: document.getElementById('landing-page'),
    game: document.getElementById('game-page'),
    results: document.getElementById('results-page'),
    about: document.getElementById('about-page'),
    'how-to-play': document.getElementById('how-to-play-page'),
    'guest-login': document.getElementById('guest-login-page')
};

function showPage(pageId) {
    Object.values(pages).forEach(page => {
        page.classList.remove('active-page');
    });
    if (pages[pageId]) {
        pages[pageId].classList.add('active-page');
    }
}

function updatePlayerDisplay() {
    document.getElementById("user-display").textContent = currentPlayerName;
    document.getElementById("current-player-status").innerHTML = `You are currently playing as: **${currentPlayerName}**`;
    document.getElementById("current-player-id").innerHTML = `Player ID: **${currentPlayerID}**`;
}

function setUsername() {
    const nameInput = document.getElementById("username-input");
    const idInput = document.getElementById("password-input");

    let newName = nameInput.value.trim();
    let newID = idInput.value.trim();
    let changed = false;
    
    if (newName.length > 0) {
        if (newName.length > 15) {
            newName = newName.substring(0, 15);
        }
        currentPlayerName = newName;
        nameInput.value = ""; 
        changed = true;
    }

    if (newID.length > 0) {
        if (/^\d{3}$/.test(newID)) { 
            currentPlayerID = newID;
            changed = true;
        } else {
            alert("Player ID must be exactly 3 digits (e.g., 123). ID not updated.");
            return; 
        }
        idInput.value = ""; 
    }

    if (changed) {
        updatePlayerDisplay();
        alert(`Player settings updated: Name: ${currentPlayerName}, ID: ${currentPlayerID}`);
    } else {
        alert("No changes made. Please enter a Username or a 3-digit ID.");
    }
    showPage('landing'); 
}

// --- Mode Selection Logic ---
function setMode(mode) {
    if (started) {
        alert("Cannot change mode while a game is active! Please reset the game first.");
        return;
    }

    currentMode = mode;
    
    document.querySelectorAll('.mode-select button').forEach(btn => {
        btn.classList.remove('active-mode-btn');
    });

    switch (mode) {
        case 'zen':
            sequenceSpeed = 1500; 
            flashTime = 300;
            document.getElementById("level-title").textContent = "Zen Mode - Press Start";
            break;
        case 'turbo':
            sequenceSpeed = 400; 
            flashTime = 100;
            document.getElementById("level-title").textContent = "Turbo Mode - Press Start";
            break;
        case 'reverse':
            sequenceSpeed = 700;
            flashTime = 200;
            document.getElementById("level-title").textContent = "Reverse Mode - Press Start";
            break;
        default: // normal
            sequenceSpeed = 700;
            flashTime = 200;
            document.getElementById("level-title").textContent = "Normal Mode - Press Start";
    }

    document.getElementById(mode + "-mode-btn").classList.add('active-mode-btn');
}


// --- Event Listeners ---
document.getElementById("start-game-btn").addEventListener("click", () => {
    if (!document.getElementById("start-game-btn").disabled) {
        startGame();
    }
});

document.getElementById("set-username-btn").addEventListener("click", setUsername);

document.addEventListener("keydown", (event) => {
    if (pages.game.classList.contains('active-page') && !started) {
        // Ensure a mode is selected before starting with keydown
        if (currentMode) { 
            startGame();
        }
    }
});

document.getElementById("restart-btn").addEventListener("click", resetGame);
document.getElementById("sound-toggle").addEventListener("click", toggleSound);

document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", function() {
        if (started) { 
            const userChosenColor = this.id;
            userClickedPattern.push(userChosenColor);
            playSound(userChosenColor);
            animatePress(userChosenColor);
            checkAnswer(userClickedPattern.length - 1);
        }
    });
});

// Mode Listeners
document.getElementById("normal-mode-btn").addEventListener("click", () => setMode('normal'));
document.getElementById("zen-mode-btn").addEventListener("click", () => setMode('zen'));
document.getElementById("turbo-mode-btn").addEventListener("click", () => setMode('turbo'));
document.getElementById("reverse-mode-btn").addEventListener("click", () => setMode('reverse'));


// --- Game Logic Functions ---

function startGame() {
    if (!started) {
        started = true;
        level = 0;
        score = 0;
        gamePattern = [];
        document.getElementById("score").textContent = "0"; 
        
        // Disable mode buttons when playing
        document.querySelectorAll('.mode-select button').forEach(btn => btn.disabled = true);
        document.getElementById("start-game-btn").disabled = true;

        setTimeout(nextSequence, 500); 
    }
}

function nextSequence() {
    userClickedPattern = [];
    level++;
    document.getElementById("level-title").textContent = `${currentMode.toUpperCase()} Mode - Level ${level}`;
    
    const randomColor = buttonColors[Math.floor(Math.random() * 4)];
    gamePattern.push(randomColor);

    const colorButton = document.getElementById(randomColor);
    colorButton.classList.add("flash");
    playSound(randomColor);
    
    setTimeout(() => {
        colorButton.classList.remove("flash");
    }, flashTime); 
}

function checkAnswer(currentLevel) {
    let correct = false;

    if (currentMode === 'reverse') {
        // In reverse mode, the user's first click must match the pattern's last color, 
        // the user's second click must match the pattern's second-to-last color, etc.
        const requiredIndex = gamePattern.length - 1 - currentLevel; 
        if (gamePattern[requiredIndex] === userClickedPattern[currentLevel]) {
            correct = true;
        }
    } else {
        // Normal, Zen, Turbo: Compare click against the same index in gamePattern.
        if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
            correct = true;
        }
    }

    if (correct) {
        if (userClickedPattern.length === gamePattern.length) {
            // SUCCESSFUL SEQUENCE
            document.body.classList.add("success-flash");
            setTimeout(() => {
                document.body.classList.remove("success-flash");
            }, 200); 
            
            // Score calculation slightly favors higher levels
            score += 10 + (level * (currentMode === 'turbo' ? 3 : 2)); 
            document.getElementById("score").textContent = score;
            
            setTimeout(nextSequence, sequenceSpeed); 
        }
    } else {
        gameOver();
    }
}

function playSound(name) {
    if (soundEnabled && sounds[name]) {
        sounds[name].currentTime = 0; 
        sounds[name].play();
    }
}

function animatePress(color) {
    const activeButton = document.getElementById(color);
    activeButton.classList.add("active");
    setTimeout(() => activeButton.classList.remove("active"), 200);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById("sound-toggle").textContent = soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
}

function gameOver() {
    playSound("wrong");
    document.body.classList.add("game-over"); 
    
    scoreHistory.push({ 
        score: score, 
        level: level, 
        player: currentPlayerName, 
        id: currentPlayerID, 
        date: new Date().toLocaleString(),
        mode: currentMode
    });
    
    document.getElementById("level-title").textContent = `Game Over! Score: ${score} (${currentMode.toUpperCase()} Mode)`;
    started = false;

    // Re-enable mode buttons after game over
    document.querySelectorAll('.mode-select button').forEach(btn => btn.disabled = false);
    document.getElementById("start-game-btn").disabled = false;


    setTimeout(() => {
        document.body.classList.remove("game-over");
        showResults();
    }, 1000); 
}

function resetGame() {
    level = 0;
    score = 0;
    started = false;
    gamePattern = [];
    userClickedPattern = [];
    
    // Re-enable mode buttons and start button
    document.querySelectorAll('.mode-select button').forEach(btn => btn.disabled = false);
    document.getElementById("start-game-btn").disabled = false;

    document.getElementById("level-title").textContent = `${currentMode.toUpperCase()} Mode - Press Start`;
    document.getElementById("score").textContent = "0";
    showPage('game'); 
}

// --- Results/Leaderboard Functions ---

function showResults() {
    showPage('results');
    
    document.getElementById("latest-score-display").textContent = `Your last score: ${score} (Level ${level}) in ${currentMode.toUpperCase()} Mode by ${currentPlayerName} (${currentPlayerID})`;
    
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = ''; 
    
    const sortedScores = [...scoreHistory].sort((a, b) => b.score - a.score);

    // Add table header
    leaderboardList.innerHTML += `
        <li>
            <span>**Rank**</span>
            <span>**Player**</span>
            <span>**Mode**</span>
            <span>**Score**</span>
            <span>**Level**</span>
        </li>
    `;

    // Add top 10 scores
    sortedScores.slice(0, 10).forEach((item, index) => {
        const rank = index + 1;
        leaderboardList.innerHTML += `
            <li>
                <span>${rank}.</span>
                <span>${item.player}</span>
                <span>${item.mode.toUpperCase()}</span>
                <span>${item.score}</span>
                <span>${item.level}</span>
            </li>
        `;
    });
}

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    showPage('landing'); 
    updatePlayerDisplay(); 
    setMode('normal'); // Initialize default mode on load and set button style
});