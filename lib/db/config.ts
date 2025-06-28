import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar o dotenv para carregar o arquivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

export const dbConfig = {
  odbc: {
    dsn: process.env.ODBC_DSN || 'OracleProd',
    user: process.env.ORACLE_USER || 'mithra',
    password: process.env.ORACLE_PASSWORD || 'fa781b5a82'
  },
  oracle: {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING,
    poolMin: 2,
    poolMax: 5,
    poolIncrement: 1
  }
}; 

export const sqlParams = {
  produtos : {
    empresas: ['1', '3', '6', '8', '9', '13'],
    grupos: [],
    subgrupos: []
  }
}