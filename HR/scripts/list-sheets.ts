import * as XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
const wb = XLSX.readFile(excelPath);

console.log('Sheet names:', wb.SheetNames);
