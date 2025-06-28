import oracledb from 'oracledb';
import { dbConfig } from './config';

let pool: oracledb.Pool | null = null;

// Função para inicializar o pool de conexões
export async function initializePool() {
  try {
    pool = await oracledb.createPool(dbConfig.oracle);
    console.log('Pool de conexões Oracle criado com sucesso');
  } catch (err) {
    console.error('Erro ao criar pool de conexões Oracle:', err);
    throw err;
  }
}

// Função para testar a conexão
export async function testConnection() {
  try {
    if (!pool) {
      await initializePool();
    }

    if (!pool) {
      throw new Error('Falha ao inicializar o pool de conexões');
    }

    const connection = await pool.getConnection();
    const result = await connection.execute('SELECT 1 FROM DUAL');
    await connection.close();
    
    console.log('Conexão com Oracle estabelecida com sucesso');
    return true;
  } catch (err) {
    console.error('Erro ao testar conexão Oracle:', err);
    return false;
  }
}

// Função para executar queries
export async function executeQuery(sql: string, params: any[] = [], options: oracledb.ExecuteOptions = {}) {
  try {
    if (!pool) {
      await initializePool();
    }

    if (!pool) {
      throw new Error('Falha ao inicializar o pool de conexões');
    }

    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...options
      });
      return result;
    } finally {
      await connection.close();
    }
  } catch (err) {
    console.error('Erro ao executar query Oracle:', err);
    throw err;
  }
}

// Função para fechar o pool de conexões
export async function closePool() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Pool de conexões Oracle fechado com sucesso');
    }
  } catch (err) {
    console.error('Erro ao fechar pool Oracle:', err);
    throw err;
  }
} 