import * as XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Get cell values directly to check
const C5 = worksheet['C5']?.v; // Row 5, Column C
const C6 = worksheet['C6']?.v;
const C7 = worksheet['C7']?.v;

console.log('=== Direct cell values ===');
console.log(`C5: ${JSON.stringify(C5)}`);
console.log(`C6: ${JSON.stringify(C6)}`);
console.log(`C7: ${JSON.stringify(C7)}`);

// Check headers (row 0)
console.log('\n=== Row 0 (header row) ===');
console.log(`A1: ${worksheet['A1']?.v}`);
console.log(`B1: ${worksheet['B1']?.v}`);
console.log(`C1: ${worksheet['C1']?.v}`);
console.log(`D1: ${worksheet['D1']?.v}`);
console.log(`E1: ${worksheet['E1']?.v}`);
console.log(`F1: ${worksheet['F1']?.v}`);
console.log(`G1: ${worksheet['G1']?.v}`);
console.log(`H1: ${worksheet['H1']?.v}`);
console.log(`I1: ${worksheet['I1']?.v}`);

// Sample data rows with column letters
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
console.log('\n=== Sample data with column letters ===');
console.log('     A (col 0) | B (1) | C (2) | D (3) | E (4) | F (5) | G (6) | H (7) | I (8)');
data.slice(1, 10).forEach((row, i) => {
  console.log(`Row ${i+1}: ${row.join(' | ')}`);
});
