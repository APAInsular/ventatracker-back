import db from '../lib/db';

// Obtener todas las compañías
export async function getAllCompanies() {
    const [rows] = await db.query('SELECT * FROM company');
    return rows;
}

// Crear una nueva compañía
export async function createCompany(name) {
    const [result] = await db.query('INSERT INTO company (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
}
