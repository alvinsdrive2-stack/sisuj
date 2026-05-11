import * as XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Get first 10 rows with all fields
console.log('Sample data with all fields:');
for (let i = 0; i < Math.min(10, data.length); i++) {
  console.log(`\n--- Row ${i + 1} ---`);
  console.log(JSON.stringify(data[i], null, 2));
}

// Check all unique keys in the data
const allKeys = new Set<string>();
for (const row of data as any[]) {
  Object.keys(row).forEach(k => allKeys.add(k));
}
console.log('\nAll column names found:', Array.from(allKeys));
