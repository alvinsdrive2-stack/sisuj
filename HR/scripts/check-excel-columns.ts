import * as XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log('=== Excel Structure (first 10 rows) ===\n');
data.slice(0, 15).forEach((row, i) => {
  console.log(`Row ${i}:`, row);
});

console.log('\n=== Column Headers ===');
console.log('Checking row 0 (headers):', data[0]);

// Get all unique keys from json format
const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
const allKeys = new Set<string>();
for (const row of jsonData.slice(0, 5)) {
  Object.keys(row).forEach(k => allKeys.add(k));
}
console.log('\nAll keys from JSON format:');
console.log(Array.from(allKeys));
