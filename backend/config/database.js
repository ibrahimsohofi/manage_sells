import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quincaillerie_jamal',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
    console.log('✅ MySQL database connected successfully');
    console.log('🏠 Host:', dbConfig.host);
    console.log('🗄️ Database:', dbConfig.database);
    console.log('👤 User:', dbConfig.user);
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
};

// Execute query function
export const executeQuery = async (query, params = []) => {
  try {
    const [rows, fields] = await pool.execute(query, params);

    // Handle different query types
    if (query.toLowerCase().trim().startsWith('select')) {
      return rows;
    } else if (query.toLowerCase().trim().startsWith('insert')) {
      return {
        insertId: rows.insertId,
        affectedRows: rows.affectedRows
      };
    } else {
      return {
        affectedRows: rows.affectedRows || 0
      };
    }
  } catch (error) {
    console.error('Query execution error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
};

// Close database connection
export const closeConnection = async () => {
  await pool.end();
};

// Get connection for transactions
export const getConnection = async () => {
  return await pool.getConnection();
};

export default pool;
