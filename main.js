const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTBLf3lCxJ0JcbeEc9nCB7eoyFKN98wIem2rDUYMBoup8Yw6kkv_T41BqwnILLBQXE5ibWV9HJAOzC/pub?output=csv';

const bookSettings = {
    'Epic': { color: '#5ba2d0', grade: "כיתה ג'" },
    'Legendary': { color: '#652286', grade: "כיתה ד'" },
    'Magical': { color: '#4e1522', grade: "כיתה ה'" },
    'Think About It': { color: '#97dee4', grade: "כיתה ו'" }
};

let allData = [];

async function loadData() {
    const grid = document.getElementById('books-grid');
    try {
        console.log("Starting to fetch data...");
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const csvText = await response.text();
        console.log("Data received, parsing...");
        
        allData = parseCSV(csvText);
        renderLibrary();
    } catch (err) {
        console.error("Error:", err);
        grid.innerHTML = `<div class="col-span-full text-center text-red-500">
            שגיאה בחיבור לנתונים. <br> 
            <small>וודאו שהגיליון מפורסם כ-CSV ושהאינטרנט מחובר.</small>
        </div>`;
    }
}

function parseCSV(csv) {
    const lines = csv.split(/\r?\n/); // מטפל גם ברווחים של ווינדוס
    const result = [];
    
    // מתחיל משורה 1 כדי לדלג על הכותרות
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        
        // פיצול חכם שמתעלם מפסיקים בתוך גרשיים (חשוב לעברית)
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        if (cols.length >= 4) {
            result.push({
                book: cols[0]?.replace(/"/g, '').trim(),
                grade: cols[1]?.replace(/"/g, '').trim(),
                chapter: cols[2]?.replace(/"/g, '').trim(),
                unitName: cols[3]?.replace(/"/g, '').trim(),
                link: cols[4]?.replace(/"/g, '').trim()
            });
        }
    }
    return result;
}

function renderLibrary() {
    const grid = document.getElementById('books-grid');
    const title = document.getElementById('page-title');
    title.innerText = "בחרו ספר לימוד";
    
    const books = [...new Set(allData.map(item => item.book))];
    
    if (books.length === 0) {
        grid.innerHTML = "<p class='col-span-full text-center'>לא נמצאו ספרים בגיליון.</p>";
        return;
    }

    grid.innerHTML = books.map(name => {
        const set = bookSettings[name] || { color: '#cbd5e1', grade: 'כללי' };
        return `
            <div onclick="showUnits('${name}')" 
                 class="wa-card bg-white rounded-[2.5rem] p-8 text-center shadow-xl border-t-[12px] cursor-pointer hover:shadow-2xl" 
                 style="border-color: ${set.color}">
                <h3 class="text-2xl font-black text-slate-800">${name}</h3>
                <p class="text-slate-400 font-bold mt-2">${set.grade}</p>
            </div>
        `;
    }).join('') + `
        <div class="wa-card bg-slate-50 rounded-[2.5rem] p-8 text-center shadow-inner border-2 border-dashed border-slate-200 cursor-pointer">
            <h3 class="text-xl font-bold text-slate-500">הספר שלי לא נמצא</h3>
            <p class="text-slate-400 mt-2">עזרו לי...</p>
        </div>
    `;
}

function showUnits(bookName) {
    const grid = document.getElementById('books-grid');
    const title = document.getElementById('page-title');
    const units = allData.filter(i => i.book === bookName);
    const color = bookSettings[bookName]?.color || '#334155';

    title.innerHTML = `
        <button onclick="renderLibrary()" class="text-sm bg-slate-200 hover:bg-slate-300 px-4 py-1 rounded-full mb-2 transition-colors">← חזרה לספרים</button>
        <div class="mt-2">יחידות לימוד: ${bookName}</div>
    `;

    grid.innerHTML = units.map(u => `
        <a href="${u.link}" target="_blank" class="no-underline">
            <div class="wa-card bg-white rounded-3xl p-6 shadow-md border-r-8 hover:bg-blue-50 transition-all text-right" style="border-color: ${color}">
                <p class="text-xs text-slate-400 font-bold">${u.chapter}</p>
                <h4 class="text-lg font-black text-slate-800">${u.unitName}</h4>
                <p class="text-blue-500 text-sm mt-2 font-bold italic">לחצו למשחק 🎮</p>
            </div>
        </a>
    `).join('');
}

// הפעלה מידית
document.addEventListener('DOMContentLoaded', loadData);
