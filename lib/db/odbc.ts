import odbc from 'odbc';
import { dbConfig } from './config';

let connection: odbc.Connection | null = null;

// Função para inicializar a conexão
export async function initializeConnection() {
  try {
    if (!connection) {
      connection = await odbc.connect(
        `DSN=${dbConfig.odbc.dsn};UID=${dbConfig.odbc.user};PWD=${dbConfig.odbc.password}`
      );
      console.log('Conexão ODBC estabelecida com sucesso');
    }
    return connection;
  } catch (err) {
    console.error('Erro ao estabelecer conexão ODBC:', err);
    throw new Error(`Erro ao estabelecer conexão ODBC: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Função para testar a conexão
export async function testConnection() {
  try {
    const conn = await initializeConnection();
    const result = await conn.query('SELECT 1 FROM DUAL');
    console.log('Teste de conexão ODBC bem-sucedido');
    return true;
  } catch (err) {
    console.error('Erro ao testar conexão ODBC:', err);
    return false;
  }
}

// Função para executar queries
export async function executeQuery(sql: string, params: any[] = []) {
  try {
    const conn = await initializeConnection();
    console.log('Executando query:', sql);
    console.log('Parâmetros:', params);
    
    const result = await conn.query(sql, params);
    console.log('Resultado da query:', result);
    
    return result;
  } catch (err) {
    console.error('Erro ao executar query ODBC:', err);
    
    // Verificar se é um erro ODBC e mostrar detalhes
    if (err && typeof err === 'object' && 'odbcErrors' in err) {
      const odbcError = err as { odbcErrors: any[] };
      console.error('Detalhes do erro ODBC:', JSON.stringify(odbcError.odbcErrors, null, 2));
      throw new Error(`Erro ao executar query ODBC: ${JSON.stringify(odbcError.odbcErrors)}`);
    }
    
    throw new Error(`Erro ao executar query ODBC: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Função para fechar a conexão
export async function closeConnection() {
  try {
    if (connection) {
      await connection.close();
      connection = null;
      console.log('Conexão ODBC fechada com sucesso');
    }
  } catch (err) {
    console.error('Erro ao fechar conexão ODBC:', err);
    throw new Error(`Erro ao fechar conexão ODBC: ${err instanceof Error ? err.message : String(err)}`);
  }
} 