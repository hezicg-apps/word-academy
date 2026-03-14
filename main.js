// --- לוגיקה מרכזית: Word Adventure ---

let words = [];
let currentMode = 'cards';
let currentIndex = 0;
let score = 0;

// 1. טעינת נתונים מה-URL
function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('w');
    
    if (data) {
        try {
            // פענוח Base64 בטוח שתומך בעברית (UTF-8)
            const decodedData = decodeURIComponent(atob(data).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const lines = decodedData.split('\n');
            const title = lines[0]; // השורה הראשונה היא כותרת היחידה
            
            words = lines.slice(1).filter(line => line.includes('-')).map(line => {
                const [eng, heb] = line.split('-').map(s => s.trim());
                return { eng, heb };
            });

            renderApp(title);
        } catch (e) {
            console.error("Error decoding data", e);
            document.getElementById('app').innerHTML = "שגיאה בטעינת המילים.";
        }
    }
}

// 2. רינדור הממשק המרכזי
function renderApp(title) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="text-center mb-8 animate-fade-in">
            <h1 class="text-3xl font-black text-blue-600 mb-2">${title}</h1>
            <div class="flex gap-2 justify-center flex-wrap">
                <button onclick="switchMode('cards')" class="px-4 py-2 bg-white border-2 border-blue-500 rounded-xl font-bold hover:bg-blue-50 transition">כרטיסיות 🗂️</button>
                <button onclick="switchMode('quiz')" class="px-4 py-2 bg-white border-2 border-green-500 rounded-xl font-bold hover:bg-green-50 transition">מבחן 📝</button>
                <button onclick="switchMode('match')" class="px-4 py-2 bg-white border-2 border-purple-500 rounded-xl font-bold hover:bg-purple-50 transition">התאמה 🧩</button>
            </div>
        </div>
        <div id="game-container" class="w-full flex flex-col items-center"></div>
    `;
    switchMode('cards');
}

// 3. החלפת מצבי משחק
function switchMode(mode) {
    currentMode = mode;
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    
    if (mode === 'cards') renderCards();
    else if (mode === 'quiz') startQuiz();
    else if (mode === 'match') startMatch();
}

// --- מצב כרטיסיות ---
function renderCards() {
    const container = document.getElementById('game-container');
    const word = words[currentIndex];
    
    container.innerHTML = `
        <div class="perspective-1000 w-80 h-96 cursor-pointer" onclick="this.classList.toggle('card-flipped')">
            <div class="card-inner w-full h-full shadow-2xl rounded-[2rem]">
                <div class="card-front bg-white text-4xl font-black text-blue-600 eng-text border-4 border-blue-200">${word.eng}</div>
                <div class="card-back bg-blue-600 text-4xl font-bold text-white border-4 border-white">${word.heb}</div>
            </div>
        </div>
        <div class="flex gap-8 mt-8 items-center">
            <button onclick="prevCard()" class="text-4xl hover:scale-120 transition">➡️</button>
            <span class="font-bold text-gray-500">${currentIndex + 1} / ${words.length}</span>
            <button onclick="nextCard()" class="text-4xl hover:scale-120 transition">⬅️</button>
        </div>
    `;
}

function nextCard() {
    currentIndex = (currentIndex + 1) % words.length;
    renderCards();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + words.length) % words.length;
    renderCards();
}

// --- מצב מבחן ---
function startQuiz() {
    score = 0;
    currentIndex = 0;
    showQuizQuestion();
}

function showQuizQuestion() {
    const container = document.getElementById('game-container');
    if (currentIndex >= words.length) {
        container.innerHTML = `<div class="text-center"><h2 class="text-3xl font-bold mb-4">כל הכבוד! ✨</h2><p class="text-xl">סיימת את המבחן.</p><button onclick="switchMode('cards')" class="mt-6 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold">חזרה לכרטיסיות</button></div>`;
        confetti();
        return;
    }

    const word = words[currentIndex];
    const options = [word.heb, ...words.filter(w => w.heb !== word.heb).sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w.heb)].sort(() => 0.5 - Math.random());

    container.innerHTML = `
        <div class="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl border-b-8 border-green-500 animate-fade-in">
            <div class="text-center mb-6">
                <span class="text-sm font-bold text-gray-400">שאלה ${currentIndex + 1} מתוך ${words.length}</span>
                <h2 class="text-4xl font-black text-gray-800 mt-2 eng-text">${word.eng}</h2>
            </div>
            <div class="grid grid-cols-1 gap-3">
                ${options.map(opt => `
                    <button onclick="checkAnswer('${opt}', '${word.heb}')" class="p-4 text-xl font-bold border-2 border-slate-100 rounded-2xl hover:bg-green-50 hover:border-green-500 transition-all text-right pr-6">${opt}</button>
                `).join('')}
            </div>
        </div>
    `;
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        currentIndex++;
        showQuizQuestion();
    } else {
        alert("נסה שוב! 💪");
    }
}

// --- מצב התאמה ---
function startMatch() {
    const container = document.getElementById('game-container');
    // לוגיקת התאמה בסיסית (ניתן להרחבה)
    container.innerHTML = `<div class="p-8 text-center bg-white rounded-3xl shadow-lg border-t-8 border-purple-500">
        <h2 class="text-2xl font-bold mb-4">משחק ההתאמה בבנייה... 🛠️</h2>
        <p>בינתיים אפשר לתרגל בכרטיסיות ובמבחן!</p>
    </div>`;
}

// --- מצב לילה ---
document.getElementById('toggleNight').addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    const btn = document.getElementById('toggleNight');
    btn.innerText = document.body.classList.contains('night-mode') ? '🌙' : '☀️';
});

// הפעלה ראשונית
loadFromUrl();