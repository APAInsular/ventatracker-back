import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import corsMiddleware from '../../../middlewares/corsMiddleware'; // Importa el middleware de CORS

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    await corsMiddleware(req, res);

    // Manejar solicitudes preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(200).end(); // Responder con éxito
        return;
    }

    const { id } = req.query;

    // Verifica que el id esté presente y sea válido
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'El ID es requerido y debe ser un valor único' });
    }

    switch (req.method) {
        case 'GET': // Obtener un producto específico
            try {
                const [rows]: [RowDataPacket[], any] = await db.query(
                    'SELECT * FROM product WHERE id = ?',
                    [id]
                );

                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Producto no encontrado' });
                }

                res.status(200).json(rows[0]); // Devuelve el producto encontrado
            } catch (error: unknown) {
                console.error('Error al obtener el producto:', error);
                res.status(500).json({ error: 'Error al obtener el producto' });
            }
            break;

        case 'PUT': // Editar un producto específico
            try {
                const { name, price } = req.body;

                // Verifica que los datos requeridos estén presentes
                if (!name || !price) {
                    return res.status(400).json({ error: 'Los campos name y price son obligatorios' });
                }

                const [result]: [ResultSetHeader, any] = await db.query(
                    'UPDATE product SET name = ?, price = ? WHERE id = ?',
                    [name, price, id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Producto no encontrado' });
                }

                res.status(200).json({ message: 'Producto actualizado con éxito' });
            } catch (error: unknown) {
                console.error('Error al actualizar el producto:', error);
                res.status(500).json({ error: 'Error al actualizar el producto' });
            }
            break;

        case 'DELETE': // Eliminar un producto específico
            try {
                const [result]: [ResultSetHeader, any] = await db.query(
                    'DELETE FROM product WHERE id = ?',
                    [id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Producto no encontrado' });
                }

                res.status(200).json({ message: 'Producto eliminado con éxito' });
            } catch (error: unknown) {
                console.error('Error al eliminar el producto:', error);
                res.status(500).json({ error: 'Error al eliminar el producto' });
            }
            break;

        default: // Método no permitido
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
    }
}
