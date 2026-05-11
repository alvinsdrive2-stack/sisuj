import * as XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
const wb = XLSX.readFile(excelPath);

// Use DATA ASESOR sheet
const worksheet = wb.Sheets['DATA ASESOR'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log('=== DATA ASESOR Sheet Structure ===\n');
console.log('     A (0) | B (1) | C (2) | D (3) | E (4) | F (5) | G (6) | H (7) | I (8)');
data.slice(0, 1).forEach(row => {
  console.log(`Header: ${row.join(' | ')}`);
});
console.log('');

data.slice(1, 15).forEach((row, i) => {
  console.log(`Row ${i+1}: ${row.map((c, idx) => c || '-').join(' | ')}`);
});

// Check column headers
const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
const allKeys = new Set<string>();
for (const row of jsonData.slice(0, 5)) {
  Object.keys(row).forEach(k => allKeys.add(k));
}
console.log('\n=== All keys from DATA ASESOR ===');
console.log(Array.from(allKeys));
