const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTBLf3lCxJ0JcbeEc9nCB7eoyFKN98wIem2rDUYMBoup8Yw6kkv_T41BqwnILLBQXE5ibWV9HJAOzC/pub?output=csv';

const bookSettings = {
    'Epic': { color: '#5ba2d0', grade: "כיתה ג'" },
    'Legendary': { color: '#652286', grade: "כיתה ד'" },
    'Magical': { color: '#4e1522', grade: "כיתה ה'" },
    'Think About It': { color: '#97dee4', grade: "כיתה ו'" }
};

async function initLibrary() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const rawData = parseCSV(csvText);
        
        // סידור הנתונים למבנה מקונן: ספר -> פרק -> יחידות
        const structuredData = organizeData(rawData);
        renderLibrary(structuredData);
    } catch (err) {
        console.error(err);
        document.getElementById('books-container').innerHTML = "שגיאה בטעינת הנתונים.";
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
            books[item.book] = { 
                name: item.book, 
                grade: item.grade, 
                chapters: {} 
            };
        }
        if (!books[item.book].chapters[item.chapter]) {
            books[item.book].chapters[item.chapter] = [];
        }
        books[item.book].chapters[item.chapter].push(item);
    });
    return books;
}

function renderLibrary(books) {
    const container = document.getElementById('books-container');
    container.innerHTML = '';

    Object.values(books).forEach(book => {
        const config = bookSettings[book.name] || { color: '#cbd5e1' };
        
        let chaptersHTML = '';
        Object.entries(book.chapters).forEach(([chapterName, units]) => {
            chaptersHTML += `
                <div class="border-b border-slate-100 last:border-0">
                    <div class="chapter-header p-4 flex justify-between items-center font-bold text-slate-700" onclick="toggleChapter(this)">
                        <span>${chapterName}</span>
                        <span class="chevron text-xs">▼</span>
                    </div>
                    <div class="units-content bg-slate-50">
                        ${units.map(u => `
                            <a href="${u.link}" target="_blank" class="block p-3 px-6 text-sm text-blue-600 hover:bg-blue-100 border-t border-white no-underline">
                                🎮 ${u.unitName}
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML += `
            <div class="book-card" style="border-color: ${config.color}">
                <div class="p-6 text-center border-b border-slate-100 bg-white">
                    <h3 class="text-2xl font-black text-slate-800">${book.name}</h3>
                    <p class="text-slate-400 font-bold text-sm">${book.grade}</p>
                </div>
                <div class="bg-white">
                    ${chaptersHTML}
                </div>
            </div>
        `;
    });
}

// פונקציית העזר לפתיחת/סגירת פרק
function toggleChapter(element) {
    const parent = element.parentElement;
    parent.classList.toggle('chapter-open');
}

document.addEventListener('DOMContentLoaded', initLibrary);
