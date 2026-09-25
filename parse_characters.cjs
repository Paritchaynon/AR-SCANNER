const fs = require('fs');

const doc = fs.readFileSync('extracted_paras.txt', 'utf8').split('\r\n');

// Let's inspect where characters begin and end
console.log('Total lines:', doc.length);

const sections = [];
let currentSec = null;

doc.forEach((line, idx) => {
  const trimmed = line.trim();
  if (
    trimmed.includes('เรื่องราวคาแรคเตอร์ "โบ้ตั๋น"') ||
    trimmed.includes('เรื่องราวคาแรคเตอร์ “รวงคำ”') ||
    trimmed.includes('เรื่องราวคาแรคเตอร์ “พฤคำ”') ||
    trimmed.includes('เรื่องราวคาแรคเตอร์ “ษาคำ”') ||
    trimmed.includes('เรื่องราวคาแรคเตอร์ บาบัว') ||
    trimmed.includes('เรื่องราวคาแรคเตอร์ “บินคำ”') ||
    trimmed.includes('“ปลาข้าวคำ”') ||
    trimmed.includes('“ดอกลอย”') ||
    trimmed.includes('ยามคำ (Yam Kham)') ||
    trimmed.includes('“พรายรวงคำ” —')
  ) {
    if (currentSec) sections.push(currentSec);
    currentSec = { title: trimmed, start: idx, lines: [] };
  } else if (currentSec) {
    currentSec.lines.push(trimmed);
  }
});
if (currentSec) sections.push(currentSec);

console.log('Found sections:', sections.map(s => s.title));
fs.writeFileSync('all_character_sections.json', JSON.stringify(sections, null, 2), 'utf8');
