const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTBLf3lCxJ0JcbeEc9nCB7eoyFKN98wIem2rDUYMBoup8Yw6kkv_T41BqwnILLBQXE5ibWV9HJAOzC/pub?output=csv';

const bookSettings = {
    'Epic': { color: '#5ba2d0', grade: "כיתה ג'" },
    'Legendary': { color: '#652286', grade: "כיתה ד'" },
    'Magical': { color: '#4e1522', grade: "כיתה ה'" },
    'Think About It': { color: '#97dee4', grade: "כיתה ו'" }
};

let allData = [];

// טעינת הנתונים מהגוגל שיטס
async function loadLibrary() {
    const grid = document.getElementById('books-grid');
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        
        allData = parseCSV(csvText);
        renderBooks();
    } catch (err) {
        grid.innerHTML = `<p class="col-span-full text-red-500">שגיאה בחיבור לנתונים. וודא שהגיליון מפורסם כ-CSV.</p>`;
    }
}

// פירוק ה-CSV לאובייקטים
function parseCSV(csv) {
    const lines = csv.split(/\r?\n/);
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 4) {
            data.push({
                book: cols[0]?.replace(/"/g, '').trim(),
                grade: cols[1]?.replace(/"/g, '').trim(),
                chapter: cols[2]?.replace(/"/g, '').trim(),
                unitName: cols[3]?.replace(/"/g, '').trim(),
                link: cols[4]?.replace(/"/g, '').trim()
            });
        }
    }
    return data;
}

// הצגת הספרים בדף הבית
function renderBooks() {
    const grid = document.getElementById('books-grid');
    const title = document.getElementById('page-title');
    title.innerText = "בחרו ספר לימוד";

    const uniqueBooks = [...new Set(allData.map(item => item.book))];

    grid.innerHTML = uniqueBooks.map(name => {
        const config = bookSettings[name] || { color: '#cbd5e1', grade: '' };
        return `
            <div onclick="showUnits('${name}')" 
                 class="wa-card bg-white p-8 text-center shadow-xl border-t-[12px] cursor-pointer" 
                 style="border-color: ${config.color}">
                <h3 class="text-2xl font-black text-slate-800">${name}</h3>
                <p class="text-slate-400 font-bold mt-2">${config.grade}</p>
            </div>
        `;
    }).join('') + `
        <div class="wa-card bg-slate-50 p-8 text-center shadow-inner border-2 border-dashed border-slate-200 cursor-pointer">
            <h3 class="text-xl font-bold text-slate-500">הספר שלי לא נמצא</h3>
            <p class="text-slate-400 mt-2">עזרו לי...</p>
        </div>
    `;
}

// הצגת היחידות של ספר שנבחר
function showUnits(bookName) {
    const grid = document.getElementById('books-grid');
    const title = document.getElementById('page-title');
    const units = allData.filter(i => i.book === bookName);
    const color = bookSettings[bookName]?.color || '#334155';

    title.innerHTML = `
        <button onclick="renderBooks()" class="text-sm bg-slate-200 hover:bg-slate-300 px-6 py-2 rounded-full mb-4 transition-all">← חזרה לספרים</button>
        <div class="mt-2">${bookName}</div>
    `;

    grid.innerHTML = units.map(u => `
        <a href="${u.link}" target="_blank" class="no-underline">
            <div class="wa-card bg-white p-6 shadow-md border-r-8 hover:bg-blue-50 transition-all text-right" style="border-color: ${color}">
                <p class="text-xs text-slate-400 font-bold mb-1">${u.chapter}</p>
                <h4 class="text-lg font-black text-slate-800">${u.unitName}</h4>
                <p class="text-blue-500 text-sm mt-3 font-bold italic">לחצו למשחק 🎮</p>
            </div>
        </a>
    `).join('');
}

// הפעלה כשהדף מוכן
document.addEventListener('DOMContentLoaded', loadLibrary);
