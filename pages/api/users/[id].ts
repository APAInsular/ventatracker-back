import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/db'; // Importa tu conexión a la base de datos
import { RowDataPacket } from 'mysql2'; // Importa el tipo para manejar los resultados de la consulta
import corsMiddleware from '../../../middlewares/corsMiddleware'; // Importa el middleware de CORS

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    await corsMiddleware(req, res);

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { id } = req.query;

        // Verifica que el id esté presente
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ error: 'El ID de usuario es requerido y debe ser un valor único' });
        }

        // Realiza la consulta a la base de datos para obtener los datos del usuario
        const [rows]: [RowDataPacket[], any] = await db.query(
            `SELECT 
                worker.id,
                worker.name,
                worker.first_surname,
                worker.second_surname,
                company.comercial_name,
                company.fiscal_name,
                worker.company_id
             FROM 
                worker
             LEFT JOIN 
                company ON worker.company_id = company.id
             WHERE 
                worker.id = ?`,
            [id]
        );
        // Verifica si se encontró un usuario con ese ID
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Devuelve los datos del usuario
        res.status(200).json(rows[0]);
    } catch (error: unknown) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error al obtener los datos del usuario' });
    }
}
