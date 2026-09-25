const fs = require('fs');
const rels = fs.readFileSync('extracted_docx/word/_rels/document.xml.rels', 'utf8');
const docXml = fs.readFileSync('extracted_docx/word/document.xml', 'utf8');

// Match images and paragraph text around them
const imgMatches = [...docXml.matchAll(/(?:<w:p\b[^>]*>.*?<\/w:p>)|(?:<w:drawing>[\s\S]*?<\/w:drawing>)/g];
console.log('Matches length:', imgMatches.length);
