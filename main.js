const SHEET_ID = '1HJ1UDVuzqvWS66hprx8dSFqqoS0OVvZFGOGaRtyDPu8'; 
const SHEET_NAME = 'Sheet1'; 

async function loadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        const data = rows
            .map(r => ({
                book: r.c[0]?.v,
                grade: r.c[1]?.v,
                chapter: r.c[2]?.v,
                unit: r.c[3]?.v,
                link: r.c[4]?.v,
                color: r.c[5]?.v || 'sky' // ברירת מחדל אם אין צבע בשיטס
            }))
            .filter(item => item.book && item.book !== 'Book' && item.link);

        renderBooks(data);
        document.getElementById('loading').style.display = 'none';
    } catch (e) {
        console.error(e);
        document.getElementById('loading').innerHTML = `<div class="text-red-500">שגיאה בטעינה.</div>`;
    }
}

function renderBooks(data) {
    const content = document.getElementById('content');
    content.innerHTML = '';
    
    const books = [...new Set(data.map(d => d.book))];

    books.forEach(bookTitle => {
        const bookData = data.filter(d => d.book === bookTitle);
        const color = bookData[0].color; 
        
        let bookHtml = `
            <div class="book-card bg-white rounded-[2.5rem] shadow-xl border-t-8 border-${color}-500 overflow-hidden h-fit">
                <div class="p-6 flex justify-between items-center border-b border-slate-50">
                    <h2 class="text-2xl font-black text-slate-800">${bookTitle}</h2>
                    <span class="bg-${color}-500 text-white px-4 py-1 rounded-full text-xs font-black">${bookData[0].grade}</span>
                </div>
                <div class="p-2">`;

        const chapters = [...new Set(bookData.map(d => d.chapter))];
        chapters.forEach(ch => {
            const units = bookData.filter(d => d.chapter === ch);
            
            bookHtml += `
                <div class="chapter-row border-b border-slate-50 last:border-0">
                    <div class="chapter-btn p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors" onclick="toggleChapter(this)">
                        <span class="font-extrabold text-slate-600 uppercase tracking-wider text-sm">${ch || 'General'}</span>
                        <span class="chevron text-slate-300">▼</span>
                    </div>
                    <div class="units-list bg-slate-50/50">
                        ${units.map(u => `
                            <a href="app/index.html?w=${u.link}" target="_blank" class="unit-link block p-3 px-8 text-sm font-bold text-slate-500 hover:text-${color}-600 hover:bg-white transition-all">
                                ${u.unit}
                            </a>
                        `).join('')}
                    </div>
                </div>`;
        });

        bookHtml += `</div></div>`;
        content.innerHTML += bookHtml;
    });
}

// פונקציית ה-Dropdown
function toggleChapter(btn) {
    const row = btn.parentElement;
    const isOpen = row.classList.contains('is-open');
    
    // סגירת פרקים אחרים באותו ספר למראה נקי
    const card = row.closest('.book-card');
    card.querySelectorAll('.chapter-row').forEach(r => r.classList.remove('is-open'));

    if (!isOpen) {
        row.classList.add('is-open');
    }
}

loadData();
