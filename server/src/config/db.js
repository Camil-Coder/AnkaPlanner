// src/config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Creamos un pool de conexiones
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,   // Espera si todas las conexiones están ocupadas
  connectionLimit: 10,        // Máximo de conexiones simultáneas
  queueLimit: 0               // Sin límite de consultas en cola
});
