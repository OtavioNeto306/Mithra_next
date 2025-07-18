import mysql from 'mysql2/promise';
import { dbConfig } from './config';

// Pool de conexões otimizado para produção
let pool: mysql.Pool | null = null;

function createPool(): mysql.Pool {
  if (!pool) {
    const poolConfig = {
      ...dbConfig.mysql,
      // 🚀 CONFIGURAÇÕES OTIMIZADAS PARA PRODUÇÃO
      waitForConnections: true,
      connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '50'),  // ✅ Configurável via env
      queueLimit: parseInt(process.env.MYSQL_QUEUE_LIMIT || '100'),          // ✅ Configurável via env
      acquireTimeout: parseInt(process.env.MYSQL_ACQUIRE_TIMEOUT || '60000'), // ✅ Configurável via env
      timeout: parseInt(process.env.MYSQL_TIMEOUT || '60000'),               // ✅ Configurável via env
      reconnect: true,                                                       // ✅ Auto-reconnect
      idleTimeout: parseInt(process.env.MYSQL_IDLE_TIMEOUT || '300000'),     // ✅ Configurável via env
      
      // Configurações adicionais de performance
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: false,
      multipleStatements: false,
      
      // Configurações de SSL e segurança
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    };

    pool = mysql.createPool(poolConfig);

    // 📊 Event handlers para monitoramento
    pool.on('connection', (connection) => {
      console.log(`✅ Nova conexão MySQL estabelecida: ${connection.threadId}`);
    });

    pool.on('acquire', (connection) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔗 Conexão adquirida: ${connection.threadId}`);
      }
    });

    pool.on('release', (connection) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔓 Conexão liberada: ${connection.threadId}`);
      }
    });
  }
  return pool;
}

// Função para executar queries
export async function executeQuery(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const connection = createPool();
    const [rows] = await connection.execute(sql, params);
    return rows as any[];
  } catch (error) {
    console.error('Erro ao executar query MySQL:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw new Error(`Erro na query MySQL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Função para executar queries de seleção com tratamento de erro mais específico
export async function selectQuery(sql: string, params: any[] = []): Promise<any[]> {
  try {
    return await executeQuery(sql, params);
  } catch (error) {
    console.error('Erro em consulta SELECT:', error);
    return [];
  }
}

// Função para testar conexão
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT 1 as test');
    return result.length > 0;
  } catch (error) {
    console.error('Erro ao testar conexão MySQL:', error);
    return false;
  }
}

// Fechar pool de conexões (útil para testes)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
} 