import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2'; // Importa tipos para las respuestas de consultas
import corsMiddleware from '../../../middlewares/corsMiddleware'; // Importa el middleware de CORS

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {

    await corsMiddleware(req, res);

    switch (req.method) {
        case 'GET':
            try {
                const { workerId } = req.query; // Asumimos que el ID del trabajador se pasa como parámetro de la consulta

                if (!workerId) {
                    return res.status(400).json({ error: 'Se requiere un worker_id para obtener los productos' });
                }

                // Obtener el ID de la empresa del trabajador
                const [worker]: [RowDataPacket[], any] = await db.query(
                    'SELECT company_id FROM worker WHERE id = ?',
                    [workerId]
                );

                if (!worker || !worker[0].company_id) {
                    return res.status(404).json({ error: 'Trabajador no encontrado o no tiene empresa asociada' });
                }

                const empresa_id = worker[0].company_id;

                // Obtener los productos de la empresa
                const [rows]: [RowDataPacket[], any] = await db.query(
                    'SELECT * FROM product WHERE company_id = ?',
                    [empresa_id]
                );

                res.status(200).json(rows);
            } catch (error: unknown) {
                console.error('Error al obtener los productos:', error);
                res.status(500).json({ error: 'Error al obtener los productos' });
            }
            break;

        case 'POST':
            try {
                const { name, price, code, brand_id, empresa_id } = req.body;

                // Verifica que los datos requeridos estén presentes
                if (!name || !price || !code || !empresa_id) {
                    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
                }

                // Inserta el producto en la base de datos
                const [result]: [ResultSetHeader, any] = await db.query(
                    'INSERT INTO product (name, price, code, brand_id, empresa_id) VALUES (?, ?, ?, ?, ?)',
                    [name, price, code, brand_id, empresa_id]
                );

                res.status(201).json({ message: 'Producto creado con éxito', productId: result.insertId });
            } catch (error: unknown) {
                console.error('Error al crear el producto:', error);
                res.status(500).json({ error: 'Error al crear el producto' });
            }
            break;

        case 'PUT':
            try {
                const { id, name, price, code, brand_id, empresa_id } = req.body;
                if (!id) {
                    return res.status(400).json({ error: 'Se requiere un ID para actualizar el producto' });
                }

                await db.query(
                    'UPDATE product SET name = ?, price = ?, code = ?, brand_id = ?, empresa_id = ? WHERE id = ?',
                    [name, price, code, brand_id, empresa_id, id]
                );
                res.status(200).json({ message: 'Producto actualizado con éxito' });
            } catch (error: unknown) {
                console.error('Error al actualizar el producto:', error);
                res.status(500).json({ error: 'Error al actualizar el producto' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ error: 'Se requiere un ID para eliminar el producto' });
                }

                await db.query('DELETE FROM products WHERE id = ?', [id]);
                res.status(200).json({ message: 'Producto eliminado con éxito' });
            } catch (error: unknown) {
                console.error('Error al eliminar el producto:', error);
                res.status(500).json({ error: 'Error al eliminar el producto' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
    }
}
