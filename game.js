// all the commands the game picks from
const allCommands = [
  "ls -la",
  "sudo apt update",
  "cd /var/log",
  "cat passwd",
  "mkdir test_dir",
  "rm -rf node_modules",
  "git commit -m 'fix bugs'",
  "npm install express",
  "docker-compose up -d",
  "ssh user@192.168.1.10",
  "ping google.com",
  "chmod +x script.sh",
  "grep -r 'error' .",
  "tar -czvf archive.tar.gz folder/",
  "systemctl restart nginx"
];

let gameCommands = []; // commands for this round
let currentIndex = 0;
let aiSpeed = 1;
let aiProgress = 0;
let aiInterval;
let gameStarted = false;

// grab the elements we need
const commandEl = document.getElementById("command");
const nextCommandEl = document.getElementById("nextCommand");
const userInput = document.getElementById("userCommand");
const userBar = document.getElementById("userBar");
const aiBar = document.getElementById("aiBar");

// shuffles the array so commands are random
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// sets up a fresh game with 5 random commands
function initGameSession() {
  gameCommands = shuffleArray(allCommands).slice(0, 5);
  currentIndex = 0;
  aiSpeed = 1; // reset speed
  gameStarted = false;
  if (aiInterval) {
    clearInterval(aiInterval);
    aiInterval = null;
  }
  loadCommands();
}

// puts the current and next command on screen
function loadCommands() {
  if (!commandEl) return; // not on the game page, skip
  
  commandEl.innerHTML = gameCommands[currentIndex];
  nextCommandEl.textContent = gameCommands[currentIndex + 1] || "—";
  userInput.value = "";
  userBar.value = 0;
  aiBar.value = 0;
  aiProgress = 0;
}

// changes ai speed based on difficulty picked
function setDifficulty(level, btn) {
  aiSpeed = level * 0.6;

  document.querySelectorAll(".diff-btn")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");
}

// kicks off the ai bar moving
function startAI() {
  if (aiInterval) return;

  aiInterval = setInterval(() => {
    aiProgress += aiSpeed;
    aiBar.value = aiProgress;

    if (aiProgress >= 100) {
      endGame(false);
    }
  }, 200);
}

// win or lose handling
function endGame(win) {
  if (win) {
    // flash green and move to next command
    document.body.classList.add("win");
    setTimeout(() => document.body.classList.remove("win"), 400);

    currentIndex++;
    aiSpeed += 0.05; // ai gets a tiny bit faster each round

    if (currentIndex < gameCommands.length) {
      loadCommands();
    } else {
      clearInterval(aiInterval);
      aiInterval = null;
      alert("You win the hackathon!");
      initGameSession(); // start over
    }
  } else {
    alert("AI won. Try again.");
    initGameSession(); // start over
  }
}

// listens for typing in the input box
if (userInput) {
  userInput.addEventListener("input", () => {
    if (!gameStarted) {
      gameStarted = true;
      startAI();
    }

    const typed = userInput.value;
    const target = gameCommands[currentIndex];

    // colour each letter green or red as you type
    let highlightedText = "";
    let isError = false;
    for (let i = 0; i < target.length; i++) {
      if (i < typed.length) {
        if (typed[i] === target[i]) {
          highlightedText += `<span style="color: green;">${target[i]}</span>`;
        } else {
          highlightedText += `<span class="error-text">${target[i]}</span>`;
          isError = true;
        }
      } else {
        highlightedText += target[i];
      }
    }
    commandEl.innerHTML = highlightedText;

    // progress bar for the user
    userBar.value = (typed.length / target.length) * 100;

    // check if they got it right
    if (typed === target && !isError) {
      endGame(true);
    }
  });

  // kick off the first game
  initGameSession();
}

// dark mode toggle stuff
const themeToggleBtn = document.getElementById("themeToggle");
const darkModeIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/></svg>`;
const lightModeIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/></svg>`;

// load saved theme on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  if (themeToggleBtn) themeToggleBtn.innerHTML = `${lightModeIcon} Light Mode`;
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      themeToggleBtn.innerHTML = `${darkModeIcon} Dark Mode`;
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      themeToggleBtn.innerHTML = `${lightModeIcon} Light Mode`;
    }
  });
}

const typingInput = document.getElementById("typingInput");
const keyCountEl = document.getElementById("keyCount");
const timeEl = document.getElementById("time");
const kpsEl = document.getElementById("kps");

let startTime = null;
let keyCount = 0;
let timerInterval = null;

if (typingInput) {
  typingInput.addEventListener("keydown", () => {
    if (!startTime) {
      startTime = Date.now();

      timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timeEl.textContent = elapsed.toFixed(1);
        kpsEl.textContent = (keyCount / elapsed).toFixed(2);
      }, 100);
    }

    keyCount++;
    keyCountEl.textContent = keyCount;
  });

  typingInput.addEventListener("input", () => {
    if (typingInput.value === "") {
      clearInterval(timerInterval);
      startTime = null;
      keyCount = 0;
      keyCountEl.textContent = 0;
      timeEl.textContent = "0.0";
      kpsEl.textContent = "0";
    }
  });
}

// random command for the roll feature
function rollTip() {
  const tipEl = document.getElementById("tipOutput");
  if (!tipEl) return;

  const pick = allCommands[Math.floor(Math.random() * allCommands.length)];
  tipEl.textContent = pick;
}
