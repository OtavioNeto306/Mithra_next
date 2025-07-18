import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar o dotenv para carregar o arquivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// Função para validar variáveis de ambiente obrigatórias
function validateRequiredEnvVars() {
  const requiredVars = {
    'ODBC_DSN': process.env.ODBC_DSN,
    'ORACLE_USER': process.env.ORACLE_USER,
    'ORACLE_PASSWORD': process.env.ORACLE_PASSWORD,
    'ORACLE_CONNECTION_STRING': process.env.ORACLE_CONNECTION_STRING
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}\n` +
      'Por favor, configure o arquivo .env baseado no .env.example'
    );
  }
}

// Validar variáveis obrigatórias
validateRequiredEnvVars();

export const dbConfig = {
  odbc: {
    dsn: process.env.ODBC_DSN,
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD
  },
  oracle: {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING,
    poolMin: parseInt(process.env.ORACLE_POOL_MIN || '2'),
    poolMax: parseInt(process.env.ORACLE_POOL_MAX || '5'),
    poolIncrement: parseInt(process.env.ORACLE_POOL_INCREMENT || '1')
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'emporio'
  }
}; 

export const sqlParams = {
  produtos : {
    empresas: ['1', '3', '6', '8', '9', '13'],
    grupos: [],
    subgrupos: []
  }
}