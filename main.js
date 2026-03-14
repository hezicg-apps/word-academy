const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTBLf3lCxJ0JcbeEc9nCB7eoyFKN98wIem2rDUYMBoup8Yw6kkv_T41BqwnILLBQXE5ibWV9HJAOzC/pub?output=csv';

const bookConfigs = {
    'Epic': '#3b82f6',
    'Legendary': '#8b5cf6',
    'Magical': '#f43f5e',
    'Think About It': '#06b6d4'
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
        grid.innerHTML = "טוען נתונים...";
    }
}

function parseCSV(csv) {
    const rows = csv.split(/\r?\n/).slice(1);
    return rows.map(r => {
        const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return { 
            book: c[0]?.replace(/"/g,'').trim(), 
            chapter: c[2]?.replace(/"/g,'').trim(), 
            unit: c[3]?.replace(/"/g,'').trim(), 
            link: c[4]?.replace(/"/g,'').trim() 
        };
    }).filter(i => i.book && i.unit);
}

function organize(data) {
    const obj = {};
    data.forEach(i => {
        if(!obj[i.book]) obj[i.book] = {};
        if(!obj[i.book][i.chapter]) obj[i.book][i.chapter] = [];
        obj[i.book][i.chapter].push(i);
    });
    return obj;
}

function render(books, grid) {
    grid.innerHTML = '';
    Object.entries(books).forEach(([name, chapters]) => {
        const color = bookConfigs[name] || '#64748b';
        
        let chaptersHTML = '';
        Object.entries(chapters).forEach(([chapName, units]) => {
            chaptersHTML += `
                <div class="chapter-row">
                    <div class="chapter-btn" onclick="this.parentElement.classList.toggle('open')">
                        <span class="chevron-icon">▼</span>
                        <span class="font-bold text-slate-700">${chapName}</span>
                    </div>
                    <div class="units-container">
                        ${units.map(u => `
                            <a href="${u.link}" target="_blank" class="unit-link">
                                ${u.unit}
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        grid.innerHTML += `
            <div class="book-card" style="border-top: 5px solid ${color}">
                <div class="p-8 border-b border-slate-50 bg-white">
                    <h3 class="text-xl font-extrabold text-slate-800">${name}</h3>
                </div>
                <div>${chaptersHTML}</div>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', init);
