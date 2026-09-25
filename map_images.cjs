const fs = require('fs');
const rels = fs.readFileSync('extracted_docx/word/_rels/document.xml.rels', 'utf8');
const rIdMap = {};
rels.replace(/Id="([^"]+)"\s+Type="[^"]*image"\s+Target="([^"]+)"/g, (_, id, target) => {
  rIdMap[id] = target;
});

const docXml = fs.readFileSync('extracted_docx/word/document.xml', 'utf8');
const pMatches = docXml.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];
let lastHeading = 'Start';
pMatches.forEach(p => {
  const text = (p.replace(/<[^>]+>/g, '')).trim();
  if (text.includes('เรื่องราวคาแรคเตอร์') || text.includes('ชื่อคาแรคเตอร์') || text.startsWith('“')) {
    lastHeading = text.substring(0, 50);
  }
  const blip = p.match(/r:embed="([^"]+)"/);
  if (blip) {
    console.log(lastHeading, '->', blip[1], '->', rIdMap[blip[1]]);
  }
});
