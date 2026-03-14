const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTBLf3lCxJ0JcbeEc9nCB7eoyFKN98wIem2rDUYMBoup8Yw6kkv_T41BqwnILLBQXE5ibWV9HJAOzC/pub?output=csv';

const bookSettings = {
    'Epic': { color: '#5ba2d0', grade: "כיתה ג'" },
    'Legendary': { color: '#652286', grade: "כיתה ד'" },
    'Magical': { color: '#4e1522', grade: "כיתה ה'" },
    'Think About It': { color: '#97dee4', grade: "כיתה ו'" }
};

async function initLibrary() {
    const container = document.getElementById('books-grid'); // וודא שה-ID תואם ל-HTML
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const rawData = parseCSV(csvText);
        const structuredData = organizeData(rawData);
        renderLibrary(structuredData, container);
    } catch (err) {
        if (container) container.innerHTML = "שגיאה בטעינת הנתונים.";
    }
}

function parseCSV(csv) {
    const lines = csv.split(/\r?\n/);
    return lines.slice(1).map(line => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return {
            book: cols[0]?.replace(/"/g, '').trim(),
            grade: cols[1]?.replace(/"/g, '').trim(),
            chapter: cols[2]?.replace(/"/g, '').trim(),
            unitName: cols[3]?.replace(/"/g, '').trim(),
            link: cols[4]?.replace(/"/g, '').trim()
        };
    }).filter(i => i.book && i.unitName);
}

function organizeData(data) {
    const books = {};
    data.forEach(item => {
        if (!books[item.book]) {
            books[item.book] = { name: item.book, grade: item.grade, chapters: {} };
        }
        if (!books[item.book].chapters[item.chapter]) {
            books[item.book].chapters[item.chapter] = [];
        }
        books[item.book].chapters[item.chapter].push(item);
    });
    return books;
}

function renderLibrary(books, container) {
    if (!container) return;
    container.innerHTML = '';

    Object.values(books).forEach(book => {
        const config = bookSettings[book.name] || { color: '#cbd5e1' };
        
        let chaptersHTML = '';
        Object.entries(book.chapters).forEach(([chapterName, units]) => {
            // כאן השינוי: הכותרת היא div עם onclick, לא קישור <a>
            chaptersHTML += `
                <div class="chapter-wrapper border-b border-slate-100 last:border-0">
                    <div class="chapter-header p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors" 
                         onclick="this.parentElement.classList.toggle('open')">
                        <span class="font-bold text-slate-700">${chapterName}</span>
                        <span class="chevron text-[0.6rem] text-slate-400 transition-transform duration-300">▼</span>
                    </div>
                    <div class="units-list max-height-0 overflow-hidden transition-all duration-300 bg-slate-50">
                        ${units.map(u => `
                            <a href="${u.link}" target="_blank" class="block p-3 px-8 text-sm text-blue-600 hover:bg-blue-100 no-underline border-t border-white">
                                🎮 ${u.unitName}
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML += `
            <div class="book-card bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-t-[12px]" style="border-color: ${config.color}">
                <div class="p-6 text-center border-b border-slate-100">
                    <h3 class="text-2xl font-black text-slate-800">${book.name}</h3>
                    <p class="text-slate-400 font-bold text-sm">${book.grade}</p>
                </div>
                <div>
                    ${chaptersHTML}
                </div>
            </div>
        `;
    });
}

// הוספת ה-CSS הנדרש לאפקט הפתיחה דרך ה-JS כדי לחסוך לך עריכת קבצים
const style = document.createElement('style');
style.innerHTML = `
    .units-list { max-height: 0; }
    .chapter-wrapper.open .units-list { max-height: 500px; }
    .chapter-wrapper.open .chevron { transform: rotate(180deg); }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', initLibrary);
