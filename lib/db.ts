import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Interface para o usuário
export interface User {
  USUARIO: string;
  NOME: string;
  USERNAME: string;
  PASSWORD: string;
  UACESSO: string;
  BLOQUEADO: number;
  COMISSAO: string;
}

// Função para abrir conexão com o banco
async function openDb() {
  return open({
    filename: 'usuarios.db3',
    driver: sqlite3.Database
  });
}

// Função para buscar usuário por código
export async function getUserByCode(codigo: string): Promise<User | null> {
  const db = await openDb();
  const user = await db.get<User>('SELECT * FROM USERCC WHERE USUARIO = ?', [codigo]);
  await db.close();
  return user || null;
}

// Função para atualizar comissão do usuário
export async function updateUserCommission(codigo: string, comissao: string): Promise<boolean> {
  try {
    const db = await openDb();
    await db.run('UPDATE USERCC SET COMISSAO = ? WHERE USUARIO = ?', [comissao, codigo]);
    await db.close();
    return true;
  } catch (error) {
    console.error('Erro ao atualizar comissão:', error);
    return false;
  }
}

// Função para buscar todos os usuários
export async function getAllUsers(): Promise<User[]> {
  const db = await openDb();
  const users = await db.all<User[]>('SELECT * FROM USERCC');
  await db.close();
  return users;
} 