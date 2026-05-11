import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  const connection = await mysql.createConnection({
    host: process.env.DB_MYGATENSI_HOST,
    port: parseInt(process.env.DB_MYGATENSI_PORT || "3306"),
    user: process.env.DB_MYGATENSI_USERNAME,
    password: process.env.DB_MYGATENSI_PASSWORD,
    database: process.env.DB_MYGATENSI_DATABASE,
  });

  try {
    const [rows] = await connection.query(
      "SELECT Nama FROM mytukbnsp ORDER BY Nama ASC"
    );
    return NextResponse.json(rows);
  } finally {
    await connection.end();
  }
}
