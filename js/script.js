// --- Application State Framework ---
let quizCatalog = {};            // Holds layout catalog metadata from catalog.json
let activeCategoryFolder = null; // Tracks the subfolder name (e.g., 'biology')
let activeQuizData = null;       // Holds questions for the active quiz ONLY
let activeQuizId = null;
let currentQuestionIndex = 0;
let userAnswers = [];
const startingLetterCode = 65;   // Ascii 'A'

// --- DOM Cache Elements ---
const dashboardView = document.getElementById("dashboardView");
const quizView = document.getElementById("quizView");
const scoreView = document.getElementById("scoreView");
const homeView = document.getElementById("homeView");

const startButton = document.getElementById("startButton");
const categoryGrid = document.getElementById("categoryGrid");
const quizSelectionArea = document.getElementById("quizSelectionArea");
const selectedCategoryName = document.getElementById("selectedCategoryName");
const quizGrid = document.getElementById("quizGrid");

const quizNameHeader = document.getElementById("quizName");
const currentQuestionIndicator = document.getElementById("currentIndicator");
const totalQuestionIndicator = document.getElementById("totalIndicator");
const customProgressBar = document.getElementById("customProgressBar");

const questionBox = document.querySelector(".question");
const answersForm = document.querySelector(".answers");

const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const submitButton = document.getElementById("submit");
const scoreContainer = document.querySelector(".score-container");

// --- Programmatic Brand Header Image Generator ---
function generateBrandHeader() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1600;
    canvas.height = 360;

    ctx.fillStyle = "#dd2b61";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "normal 110px 'The Last Trunks', Impact, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "6px";

    ctx.fillText("THE FINAL OPTION", canvas.width / 2, canvas.height / 2);

    const headerImg = document.getElementById("brandHeaderLogo");
    if (headerImg) {
        headerImg.src = canvas.toDataURL("image/png");
    }
}

// --- Dynamic Catalog Setup Fetch Engine ---
async function loadQuizCatalog() {
    try {
        // FIX 1: Points precisely to your modular routing structure catalog file
        const response = await fetch("../data/catalog.json");

        if (!response.ok) {
            throw new Error(`HTTP network error! status: ${response.status}`);
        }

        quizCatalog = await response.json();
        return true;
    } catch (error) {
        console.error("Critical failure loading quiz catalog file:", error);
        alert("Failed to load quiz categories. Please refresh or try again later.");
        return false;
    }
}

// --- View Change Controller ---
const switchView = (viewToShow) => {
    homeView.classList.add("hidden");
    dashboardView.classList.add("hidden");
    quizView.classList.add("hidden");
    scoreView.classList.add("hidden");

    viewToShow.classList.remove("hidden");
};

// --- Storage & Session Persistence Logic ---
const saveQuizSession = () => {
    if (activeQuizId && activeQuizData && activeCategoryFolder) {
        const runtimeSession = {
            quizId: activeQuizId,
            folder: activeCategoryFolder,
            index: currentQuestionIndex,
            answers: userAnswers
        };
        localStorage.setItem("last_quiz_session", JSON.stringify(runtimeSession));
    }
};

const clearQuizSession = () => {
    localStorage.removeItem("last_quiz_session");
};

// FIX 2: Rewritten as an Async process to safely fetch subfolder data on browser reboots
async function attemptRestoreSession() {
    const savedData = localStorage.getItem("last_quiz_session");
    if (!savedData) return false;

    try {
        const session = JSON.parse(savedData);

        // Dynamically request the subfolder quiz asset based on your tracking storage data
        const response = await fetch(`../data/${session.folder}/${session.quizId}.json`);
        if (!response.ok) return false;

        activeQuizData = await response.json();
        activeQuizId = session.quizId;
        activeCategoryFolder = session.folder;
        currentQuestionIndex = session.index;
        userAnswers = session.answers;
        return true;
    } catch (e) {
        console.error("Session restoration file access aborted.", e);
        clearQuizSession();
        return false;
    }
}

// --- Dashboard Rendering Engines ---
const renderCategoryDashboard = () => {
    categoryGrid.innerHTML = "";
    quizSelectionArea.classList.add("hidden");
    categoryGrid.classList.remove("hidden");

    for (const [key, category] of Object.entries(quizCatalog)) {
        const card = document.createElement("div");
        card.className = "dashboard-card category-card";
        card.innerText = category.title;
        card.addEventListener("click", () => showQuizSelection(key));
        categoryGrid.appendChild(card);
    }
};

const showQuizSelection = (categoryKey) => {
    const category = quizCatalog[categoryKey];
    activeCategoryFolder = category.folder; // Sets it for manual navigation

    selectedCategoryName.innerText = `${category.title} Quizzes`;
    quizGrid.innerHTML = "";

    category.quizzes.forEach(quiz => {
        const card = document.createElement("div");
        card.className = "dashboard-card quiz-card";
        card.innerText = quiz.title;

        // --- UPDATE THIS LINE ---
        // Pass a combined object so startQuiz explicitly receives the folder path context
        card.addEventListener("click", () => startQuiz({
            id: quiz.id,
            title: quiz.title,
            folder: category.folder
        }));

        quizGrid.appendChild(card);
    });

    categoryGrid.classList.add("hidden");
    quizSelectionArea.classList.remove("hidden");
};

// --- Core Quiz Initialization & Flow Controls ---
async function startQuiz(quizMetadata) {
    // Instantly blank out text layouts to permanently solve visual ghosting issues
    questionBox.innerText = "Loading quiz questions...";
    answersForm.innerHTML = "";

    activeCategoryFolder = quizMetadata.folder;

    activeQuizId = quizMetadata.id;
    switchView(quizView);

    try {
        // Pull down the standalone target file using your path strings
        const response = await fetch(`../data/${activeCategoryFolder}/${activeQuizId}.json`);

        if (!response.ok) throw new Error(`Quiz data file could not be found!`);

        activeQuizData = await response.json();
        currentQuestionIndex = 0;
        userAnswers = new Array(activeQuizData.questions.length).fill(undefined);

        clearQuizSession();
        renderQuizFrame();
    } catch (error) {
        console.error("Failed to fetch target quiz file dataset:", error);
        alert("Could not load this specific quiz file. Returning to main menu.");
        renderCategoryDashboard();
        switchView(dashboardView);
    }
}

// --- Render Engine with Swipe Animations ---
const renderQuizFrame = () => {
    if (!activeQuizData) return;

    quizView.querySelector(".quiz-container").classList.add("exit-up");

    setTimeout(() => {
        const currentQuizQuestions = activeQuizData.questions;
        const currentQuestion = currentQuizQuestions[currentQuestionIndex];
        const quizContainerElement = quizView.querySelector(".quiz-container");

        quizView.scrollIntoView({ behavior: "smooth", block: "start" });

        quizNameHeader.innerText = activeQuizData.title;
        currentQuestionIndicator.innerText = currentQuestionIndex + 1;
        totalQuestionIndicator.innerText = currentQuizQuestions.length;

        const progressPercent = ((currentQuestionIndex + 1) / currentQuizQuestions.length) * 100;
        customProgressBar.style.width = `${progressPercent}%`;

        questionBox.innerText = currentQuestion.question;
        answersForm.innerHTML = "";

        currentQuestion.answers.forEach((ans, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = "option-wrapper";

            const radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = "quiz_option";
            radioInput.id = `opt_${index}`;
            radioInput.value = index;

            if (userAnswers[currentQuestionIndex] === index) {
                radioInput.checked = true;
            }

            const label = document.createElement("label");
            label.htmlFor = `opt_${index}`;
            const letter = String.fromCodePoint(startingLetterCode + index);
            label.innerText = `${letter}. ${ans}`;

            wrapper.appendChild(radioInput);
            wrapper.appendChild(label);
            answersForm.appendChild(wrapper);
        });

        updateNavigationControls();

        quizContainerElement.classList.remove("exit-up");
        quizContainerElement.classList.add("enter-bottom");

        requestAnimationFrame(() => {
            setTimeout(() => {
                quizContainerElement.classList.remove("enter-bottom");
            }, 20);
        });

        saveQuizSession();
    }, 250);
};

// --- State-Based Submit Button Visibility Logic ---
const updateNavigationControls = () => {
    const totalQuestions = activeQuizData.questions.length;

    previousButton.disabled = (currentQuestionIndex === 0);

    const isOnLastQuestion = (currentQuestionIndex === totalQuestions - 1);
    const lastQuestionIsAnswered = (userAnswers[totalQuestions - 1] !== undefined);

    if (isOnLastQuestion) {
        nextButton.hidden = true;
        submitButton.hidden = !lastQuestionIsAnswered;
    } else {
        nextButton.hidden = false;
        submitButton.hidden = true;
    }
};

// --- Radio Change Listener ---
answersForm.addEventListener("change", (e) => {
    if (e.target.name === "quiz_option") {
        userAnswers[currentQuestionIndex] = parseInt(e.target.value, 10);
        updateNavigationControls();
        saveQuizSession();
    }
});

startButton.onclick = () => {
    renderCategoryDashboard();
    switchView(dashboardView);
};

previousButton.onclick = () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuizFrame();
    }
};

nextButton.onclick = () => {
    if (currentQuestionIndex < activeQuizData.questions.length - 1) {
        currentQuestionIndex++;
        renderQuizFrame();
    }
};

submitButton.onclick = () => {
    const uncompletedQuestions = userAnswers.includes(undefined);

    if (uncompletedQuestions) {
        alert("Please answer all questions before submitting your results!");
        return;
    }

    let finalScore = 0;
    activeQuizData.questions.forEach((q, idx) => {
        if (q.answers[userAnswers[idx]] === q.correctAnswer) {
            finalScore++;
        }
    });

    clearQuizSession();
    activeQuizData = null;

    scoreContainer.innerHTML = `<h3>You Scored</h3><h1>${finalScore} / ${userAnswers.length}</h1>`;
    switchView(scoreView);
};

// --- Miscellaneous Navigation Bindings ---
document.getElementById("backToCategories").onclick = () => {
    renderCategoryDashboard();
};

document.getElementById("quitQuiz").onclick = () => {
    if (confirm("Are you sure you want to quit? Your progress on this quiz will be lost.")) {
        clearQuizSession();
        activeQuizData = null;
        renderCategoryDashboard();
        switchView(dashboardView);
    }
};

document.getElementById("homeButton").onclick = () => {
    renderCategoryDashboard();
    switchView(dashboardView);
};

// Browser Lifecycle Exit Safeguards
window.addEventListener("beforeunload", (event) => {
    if (activeQuizData) {
        event.preventDefault();
        event.returnValue = "Progress will be lost if you leave right now.";
    }
});

// --- App Initialization Entry Point ---
window.addEventListener("load", async () => {
    // Generate the brand text canvas image layout asset on start
    generateBrandHeader();

    // 1. Wait for the external directory config catalog file to sync first
    const dataLoadedSuccessfully = await loadQuizCatalog();
    if (!dataLoadedSuccessfully) return;

    // 2. Safely parse and reconstruct session traces over async server tracks
    const restored = await attemptRestoreSession();
    if (restored) {
        switchView(quizView);
        renderQuizFrame();
    } else {
        switchView(homeView);
    }
});