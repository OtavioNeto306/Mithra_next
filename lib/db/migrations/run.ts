import { openDb } from '../../db'
import fs from 'fs'
import path from 'path'

async function runMigrations() {
  try {
    const db = await openDb()
    
    // Lê o arquivo de migração
    const migrationPath = path.join(__dirname, 'create_configuracoes_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Executa a migração
    await db.exec(migrationSQL)
    
    console.log('Migração executada com sucesso!')
  } catch (error) {
    console.error('Erro ao executar migração:', error)
    process.exit(1)
  }
}

runMigrations() 