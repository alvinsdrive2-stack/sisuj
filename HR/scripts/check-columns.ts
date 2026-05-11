import * as XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Column headers:');
console.log(data[0]);

console.log('\nFirst 5 data rows:');
for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
  console.log(data[i]);
}
