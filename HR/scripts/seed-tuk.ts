import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

const prisma = new PrismaClient();

async function main() {
  const wb = XLSX.readFile("C:/Users/Alvia/Downloads/1. Database TUK LSP Gatensi Karya Konstruksi (1).xlsx");
  const ws = wb.Sheets["Daftar TUK"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Header is row index 1, data starts at index 2
  const header = data[1] as string[];
  const rows = data.slice(2);

  console.log(`Found ${rows.length} TUK records`);

  await prisma.adminTUK.deleteMany();
  console.log("Cleared existing data");

  const col = (name: string) => header.indexOf(name);

  let created = 0;
  for (const row of rows as any[][]) {
    const no = row[col("No")];
    if (!no || typeof no !== "number") continue;

    const name = (row[col("Nama TUK")] || "").toString().trim();
    if (!name) continue;

    const submissionDateRaw = row[col("Tanggal Pengajuan")];
    const registrationNo = (row[col("No Registrasi")] || "").toString().trim() || null;
    const jenisTuk = (row[col("Jenis TUK")] || "").toString().trim().toLowerCase();
    const tukType = jenisTuk.includes("sewaktu") ? 2 : 1;
    const address = (row[col("Alamat")] || "").toString().trim() || null;
    const province = (row[col("Provinsi")] || "").toString().trim() || null;
    const adminRegion = (row[col("Wilayah")] || "").toString().trim() || null;
    const adminName = (row[col("Admin TUK")] || "").toString().trim() || null;
    const ketuaTuk = (row[col("Ketua TUK")] || "").toString().trim() || null;

    let submissionDate: Date | null = null;
    if (submissionDateRaw) {
      const parsed = new Date(submissionDateRaw);
      if (!isNaN(parsed.getTime())) submissionDate = parsed;
    }

    await prisma.adminTUK.create({
      data: {
        submissionDate,
        registrationNo,
        name,
        tukType,
        address,
        province,
        adminRegion,
        adminName,
        ketuaTuk,
      },
    });
    created++;
  }

  console.log(`Seeded ${created} Admin TUK records`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
