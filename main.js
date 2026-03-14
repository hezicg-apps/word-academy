const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTBLf3lCxJ0JcbeEc9nCB7eoyFKN98wIem2rDUYMBoup8Yw6kkv_T41BqwnILLBQXE5ibWV9HJAOzC/pub?output=csv';

// מפת צבעים במידה ולא הוגדר בשיטס
const fallbackColors = {
    'Magical': '#a855f7',
    'Legendary': '#f59e0b',
    'Epic': '#3b82f6',
    'Think About It': '#10b981'
};

async function init() {
    const grid = document.getElementById('books-grid');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const parsed = parseCSV(data);
        const books = organize(parsed);
        render(books, grid);
    } catch (e) {
        console.error(e);
    }
}

function parseCSV(csv) {
    const rows = csv.split(/\r?\n/).slice(1);
    return rows.map(r => {
        const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return { 
            book: c[0]?.replace(/"/g,'').trim(),
            grade: c[1]?.replace(/"/g,'').trim(),
            chapter: c[2]?.replace(/"/g,'').trim(),
            unit: c[3]?.replace(/"/g,'').trim(),
            link: c[4]?.replace(/"/g,'').trim(),
            color: c[5]?.replace(/"/g,'').trim() // עמודה F
        };
    }).filter(i => i.book);
}

function organize(data) {
    const obj = {};
    data.forEach(i => {
        if(!obj[i.book]) obj[i.book] = { name: i.book, grade: i.grade, color: i.color, chaps: {} };
        if(!obj[i.book].chaps[i.chapter]) obj[i.book].chaps[i.chapter] = [];
        obj[i.book].chaps[i.chapter].push(i);
    });
    return obj;
}

function render(books, grid) {
    grid.innerHTML = '';
    Object.values(books).forEach(book => {
        // המרת שמות צבעים של Tailwind לקוד HEX במידת הצורך, או שימוש בערך מהשיטס
        const headerColor = book.color || fallbackColors[book.name] || '#64748b';
        
        let chaptersHTML = '';
        Object.entries(book.chaps).forEach(([chapName, units]) => {
            chaptersHTML += `
                <div class="chapter-row">
                    <div class="chapter-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="chevron">∨</span>
                        <span class="chapter-title">${chapName}</span>
                    </div>
                    <div class="units-list">
                        ${units.map(u => `
                            <a href="${u.link}" target="_blank" class="unit-link">${u.unit}</a>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        grid.innerHTML += `
            <div class="book-card">
                <div class="book-header" style="background-color: ${headerColor}">
                    <h3 class="text-white text-xl font-extrabold">${book.name}</h3>
                    <span class="grade-badge">${book.grade}</span>
                </div>
                <div class="py-2">${chaptersHTML}</div>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', init);
