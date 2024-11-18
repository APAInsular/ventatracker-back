import db from '../lib/db';

// Obtener todas las sucursales de una compañía
export async function getBranchesByCompany(companyId) {
    const [rows] = await db.query('SELECT * FROM branch WHERE company_id = ?', [companyId]);
    return rows;
}

// Crear una nueva sucursal
export async function createBranch(name, companyId) {
    const [result] = await db.query(
        'INSERT INTO branch (name, company_id) VALUES (?, ?)',
        [name, companyId]
    );
    return { id: result.insertId, name, companyId };
}
