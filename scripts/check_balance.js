const fs = require('fs');
const content = fs.readFileSync('frontend/reportcard.html', 'utf8');
// Find the last <script> block (the main one)
const parts = content.split('<script>');
const lastPart = parts[parts.length - 1];
const js = lastPart.split('</script>')[0];
if (!js || js.length < 100) { console.log('No script found'); process.exit(1); }
let braces = 0, parens = 0, brackets = 0;
for (const ch of js) {
  if (ch === '{') braces++;
  if (ch === '}') braces--;
  if (ch === '(') parens++;
  if (ch === ')') parens--;
  if (ch === '[') brackets++;
  if (ch === ']') brackets--;
}
console.log('Braces:', braces === 0 ? 'BALANCED' : 'IMBALANCED (' + braces + ')');
console.log('Parens:', parens === 0 ? 'BALANCED' : 'IMBALANCED (' + parens + ')');
console.log('Brackets:', brackets === 0 ? 'BALANCED' : 'IMBALANCED (' + brackets + ')');
const escapeCount = (js.match(/escapeHtml/g) || []).length;
console.log('escapeHtml calls:', escapeCount);
