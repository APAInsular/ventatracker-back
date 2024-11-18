import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2'; // Importa tipos para las respuestas de consultas

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    switch (req.method) {
        case 'GET':
            try {
                const [rows]: [RowDataPacket[], any] = await db.query('SELECT * FROM products');
                res.status(200).json(rows);
            } catch (error: unknown) {
                console.error('Error al obtener los productos:', error);
                res.status(500).json({ error: 'Error al obtener los productos' });
            }
            break;

        case 'POST':
            try {
                const { name, price, description } = req.body;

                // Verifica que los datos requeridos estén presentes
                if (!name || !price || !description) {
                    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
                }

                // Inserta el producto en la base de datos
                const [result]: [ResultSetHeader, any] = await db.query(
                    'INSERT INTO products (name, price, description) VALUES (?, ?, ?)', 
                    [name, price, description]
                );

                res.status(201).json({ message: 'Producto creado con éxito', productId: result.insertId });
            } catch (error: unknown) {
                console.error('Error al crear el producto:', error);
                res.status(500).json({ error: 'Error al crear el producto' });
            }
            break;

        case 'PUT':
            try {
                const { id, name, price, description } = req.body;
                if (!id) {
                    return res.status(400).json({ error: 'Se requiere un ID para actualizar el producto' });
                }

                await db.query('UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?', 
                    [name, price, description, id]
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
