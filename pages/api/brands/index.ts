import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2'; // Tipos para las respuestas de consultas
import corsMiddleware from '../../../middlewares/corsMiddleware'; // Middleware de CORS

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {

    await corsMiddleware(req, res);

    switch (req.method) {
        case 'GET': // Obtener todas las marcas
            try {
                const [rows]: [RowDataPacket[], any] = await db.query('SELECT * FROM brand');
                res.status(200).json(rows);
            } catch (error: unknown) {
                console.error('Error al obtener las marcas:', error);
                res.status(500).json({ error: 'Error al obtener las marcas' });
            }
            break;

        case 'POST': // Crear una nueva marca
            try {
                const { name } = req.body;

                if (!name) {
                    return res.status(400).json({ error: 'El campo "name" es obligatorio' });
                }

                // Inserta la nueva marca en la base de datos
                const [result]: [ResultSetHeader, any] = await db.query(
                    'INSERT INTO brand (name) VALUES (?)',
                    [name]
                );

                res.status(201).json({ message: 'Marca creada con éxito', brandId: result.insertId });
            } catch (error: unknown) {
                console.error('Error al crear la marca:', error);
                res.status(500).json({ error: 'Error al crear la marca' });
            }
            break;

        case 'PUT': // Actualizar una marca existente
            try {
                const { id, name } = req.body;

                if (!id || !name) {
                    return res.status(400).json({ error: 'Se requieren los campos "id" y "name" para actualizar una marca' });
                }

                const [result]: [ResultSetHeader, any] = await db.query(
                    'UPDATE brand SET name = ? WHERE id = ?',
                    [name, id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Marca no encontrada' });
                }

                res.status(200).json({ message: 'Marca actualizada con éxito' });
            } catch (error: unknown) {
                console.error('Error al actualizar la marca:', error);
                res.status(500).json({ error: 'Error al actualizar la marca' });
            }
            break;

        case 'DELETE': // Eliminar una marca
            try {
                const { id } = req.query;

                if (!id) {
                    return res.status(400).json({ error: 'Se requiere el campo "id" para eliminar una marca' });
                }

                const [result]: [ResultSetHeader, any] = await db.query(
                    'DELETE FROM brand WHERE id = ?',
                    [id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Marca no encontrada' });
                }

                res.status(200).json({ message: 'Marca eliminada con éxito' });
            } catch (error: unknown) {
                console.error('Error al eliminar la marca:', error);
                res.status(500).json({ error: 'Error al eliminar la marca' });
            }
            break;

        default: // Método no permitido
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
    }
}
