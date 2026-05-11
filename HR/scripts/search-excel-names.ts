import * as XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(worksheet) as any[];

// Get all unique names from __EMPTY_5
const excelNames = new Set<string>();
for (const row of excelData) {
  const nama = row['__EMPTY_5'];
  if (nama) excelNames.add(nama.trim());
}

console.log(`Excel unique asesor names: ${excelNames.size}`);
console.log('\n=== Sample names from Excel ===');
Array.from(excelNames).slice(0, 30).forEach(n => console.log(`  - ${n}`));

// Search for specific names that are not found
const notFound = [
  'A. LEKSMONO MULJADINATA',
  'Acep Hidayat, S.T., M.T.',
  'Achmad Supadi',
  'Ade Hapidin',
  'Asep Supriatna',
  'ANTONIUS SONNY DJOJOACHMADI'
];

console.log('\n=== Searching for NOT FOUND names ===');
notFound.forEach(search => {
  const found = Array.from(excelNames).filter(n =>
    n.toLowerCase().includes(search.toLowerCase()) ||
    search.toLowerCase().includes(n.toLowerCase())
  );
  console.log(`\n${search}:`);
  if (found.length > 0) {
    found.forEach(f => console.log(`  → Found: "${f}"`));
  } else {
    console.log(`  → NOT FOUND in Excel`);
  }
});
