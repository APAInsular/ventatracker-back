import db from '../lib/db';

// Obtener todos los usuarios de una sucursal
export async function getUsersByBranch(branchId) {
    const [rows] = await db.query('SELECT * FROM worker WHERE branch_id = ?', [branchId]);
    return rows;
}

// Crear un nuevo usuario
export async function createUser(name, email, branchId) {
    const [result] = await db.query(
        'INSERT INTO user (name, email, branch_id) VALUES (?, ?, ?)',
        [name, email, branchId]
    );
    return { id: result.insertId, name, email, branchId };
}
