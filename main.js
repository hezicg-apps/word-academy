const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTBLf3lCxJ0JcbeEc9nCB7eoyFKN98wIem2rDUYMBoup8Yw6kkv_T41BqwnILLBQXE5ibWV9HJAOzC/pub?output=csv';

// הגדרת צבעים למקרה שאין בשיטס (לפי הצילום מסך)
const colorMap = {
    'Magical': '#8b5cf6',   // סגול
    'Legendary': '#f59e0b', // כתום
    'Epic': '#3b82f6',      // כחול
    'Think About It': '#10b981' // ירוק
};

async function init() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const parsed = parseCSV(data);
        const organized = groupData(parsed);
        render(organized);
    } catch (e) {
        console.error("טעינה נכשלה", e);
    }
}

function parseCSV(csv) {
    const lines = csv.split(/\r?\n/).slice(1);
    return lines.map(line => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return {
            book: cols[0]?.replace(/"/g, '').trim(),
            grade: cols[1]?.replace(/"/g, '').trim(),
            chapter: cols[2]?.replace(/"/g, '').trim(),
            unit: cols[3]?.replace(/"/g, '').trim(),
            link: cols[4]?.replace(/"/g, '').trim(),
            color: cols[5]?.replace(/"/g, '').trim()
        };
    }).filter(row => row.book);
}

function groupData(data) {
    const books = {};
    data.forEach(row => {
        if (!books[row.book]) {
            books[row.book] = { 
                name: row.book, 
                grade: row.grade, 
                color: row.color, 
                chapters: {} 
            };
        }
        if (!books[row.book].chapters[row.chapter]) {
            books[row.book].chapters[row.chapter] = [];
        }
        books[row.book].chapters[row.chapter].push(row);
    });
    return books;
}

function render(books) {
    const grid = document.getElementById('books-grid');
    grid.innerHTML = '';

    Object.values(books).forEach(book => {
        const bg = book.color || colorMap[book.name] || '#64748b';
        
        let chaptersHTML = '';
        Object.entries(book.chapters).forEach(([name, units]) => {
            chaptersHTML += `
                <div class="chapter-row">
                    <div class="chapter-btn" onclick="toggleChapter(this)">
                        <span class="chapter-title">${name.toUpperCase()}</span>
                        <span class="chevron">∨</span>
                    </div>
                    <div class="units-list">
                        ${units.map(u => `<a href="${u.link}" target="_blank" class="unit-link">${u.unit}</a>`).join('')}
                    </div>
                </div>
            `;
        });

        grid.innerHTML += `
            <div class="book-card">
                <div class="book-header" style="background-color: ${bg}">
                    <h3 class="text-xl font-extrabold m-0">${book.name}</h3>
                    <span class="grade-badge">${book.grade}</span>
                </div>
                <div>${chaptersHTML}</div>
            </div>
        `;
    });
}

// פונקציית הפתיחה/סגירה
function toggleChapter(btn) {
    const row = btn.parentElement;
    const isOpen = row.classList.contains('is-open');
    
    // סגור את כל שאר הפרקים באותו ספר (אופציונלי - למראה נקי יותר)
    const allRows = row.parentElement.querySelectorAll('.chapter-row');
    allRows.forEach(r => r.classList.remove('is-open'));

    if (!isOpen) {
        row.classList.add('is-open');
    }
}

document.addEventListener('DOMContentLoaded', init);
