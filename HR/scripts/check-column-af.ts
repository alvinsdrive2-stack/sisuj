import * as XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets['DATA ASESOR'];

// Get raw data
const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

console.log('=== Row 2 (Header row) - check column names ===\n');
const headerRow = rawData[1];
console.log('Total columns:', headerRow.length);

// Print column names with indices
for (let i = 0; i < Math.min(40, headerRow.length); i++) {
  const colLetter = String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String.fromCharCode(65 + Math.floor(i / 26) - 1) : '');
  const colLetter2 = i >= 26 ? String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)) : colLetter;
  console.log(`Index ${i} (Col ${colLetter2}): "${headerRow[i]}"`);
}

console.log('\n=== Sample data row 3 (IR. EDISON) - check key columns ===');
const dataRow3 = rawData[2];
console.log(`Nama Asesor (idx 2): "${dataRow3[2]}"`);
console.log(`No Registrasi Askom (idx 9): "${dataRow3[9]}"`);
console.log(`Pendaftaran BNSP (idx 8): "${dataRow3[8]}"`);
console.log(`Pendaftaran LPJK (idx 9): "${dataRow3[9]}"`);
console.log(`Nomor MET (idx 27): "${dataRow3[27]}"`);
console.log(`Column AF (idx 31): "${dataRow3[31] || '-'}"`);
