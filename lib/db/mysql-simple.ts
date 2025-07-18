import mysql from 'mysql2/promise';
import { dbConfig } from './config';

// Função simplificada para testar conexão
export async function testMySQLConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  console.log('=== DEBUG MYSQL CONNECTION ===');
  
  // Log das variáveis de ambiente
  console.log('ENV Variables:');
  console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
  console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
  console.log('MYSQL_USER:', process.env.MYSQL_USER);
  console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '***' : 'undefined');
  console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
  
  const config = {
    host: dbConfig.mysql.host,
    port: dbConfig.mysql.port,
    user: dbConfig.mysql.user,
    password: dbConfig.mysql.password,
    database: dbConfig.mysql.database,
    authPlugins: {
      mysql_native_password: () => () => Buffer.alloc(0)
    }
  };
  
  console.log('Config final:', {
    ...config,
    password: config.password ? '***' : 'empty'
  });
  
  try {
    console.log('Tentando conectar...');
    const connection = await mysql.createConnection(config);
    console.log('Conexão estabelecida!');
    
    console.log('Executando query de teste...');
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM cabpdv');
    console.log('Query executada:', rows);
    
    const [pedidos] = await connection.execute('SELECT CHAVE, NUMERO, CLIENTE, VALOR FROM cabpdv LIMIT 2');
    console.log('Primeiros pedidos:', pedidos);
    
    await connection.end();
    console.log('Conexão fechada.');
    
    return {
      success: true,
      message: 'Conexão MySQL funcionando!',
      data: { total: (rows as any)[0].total, pedidos }
    };
    
  } catch (error) {
    console.error('ERRO MySQL:', error);
    return {
      success: false,
      message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

// Função simplificada para executar queries
export async function executeSimpleQuery(sql: string, params: any[] = []): Promise<any[]> {
  const config = {
    host: dbConfig.mysql.host,
    port: dbConfig.mysql.port,
    user: dbConfig.mysql.user,
    password: dbConfig.mysql.password,
    database: dbConfig.mysql.database,
    authPlugins: {
      mysql_native_password: () => () => Buffer.alloc(0)
    }
  };
  
  try {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute(sql, params);
    await connection.end();
    return rows as any[];
  } catch (error) {
    console.error('Erro na query simples:', error);
    throw error;
  }
} 