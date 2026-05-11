import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '103.150.87.31',
  user: process.env.DB_USER || 'lspgatensi_HRv',
  password: process.env.DB_PASSWORD || 'HR@111333!#!v',
  database: process.env.DB_NAME || 'lspgatensi_hr',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
