import mysql from 'mysql2/promise';

// Interface para configuração da conexão
interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Configuração do banco (usar variáveis de ambiente em produção)
const config: MySQLConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'database_name'
};

// Pool de conexões para melhor performance
let pool: mysql.Pool | null = null;

function createPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
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