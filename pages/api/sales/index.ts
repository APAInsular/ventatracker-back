import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/db'; // Importa tu conexión a la base de datos
import { RowDataPacket } from 'mysql2'; // Importa el tipo para manejar los resultados de la consulta
import { ResultSetHeader } from 'mysql2'; // Importa el tipo adecuado
import corsMiddleware from '../../../middlewares/corsMiddleware'; // Importa el middleware de CORS

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    await corsMiddleware(req, res);

    switch (req.method) {
        case 'GET':
            try {
                // Obtener las fechas de inicio, fin y workerId de la consulta
                const { start, end, workerId } = req.query;

                // Validar que workerId, start y end estén presentes
                if (!start || !end || !workerId || Array.isArray(workerId)) {
                    return res.status(400).json({ error: 'start, end y workerId son requeridos' });
                }

                // Realizar la consulta a la base de datos con el intervalo de fechas
                const [rows]: [RowDataPacket[], any] = await db.query(
                    `SELECT 
                        product.id AS product_id, 
                        product.name AS product_name, 
                        product.price,
                        COALESCE(SUM(sale.quantity), 0) AS total_sales
                    FROM 
                        product 
                    LEFT JOIN 
                        sale ON sale.product_id = product.id AND sale.date BETWEEN ? AND ?
                    JOIN
                        worker ON worker.company_id = product.company_id
                    WHERE 
                        worker.id = ?  -- Filtrar por el trabajador (que tiene una empresa asociada)
                    GROUP BY 
                        product.id
                    ORDER BY 
                        product.name`,
                    [start, end, workerId] // Pasar start, end y workerId
                );

                // Devolver la respuesta con los productos y sus ventas
                res.status(200).json(rows);
            } catch (error: unknown) {
                console.error('Error al obtener las ventas:', error);
                res.status(500).json({ error: 'Error al obtener las ventas' });
            }
            break;

        case 'POST':
            try {
                const { date, quantity, product_id, worker_id } = req.body;

                // Verifica que los datos requeridos estén presentes
                if (!date || !quantity || !product_id || !worker_id) {
                    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
                }

                const [result]: [ResultSetHeader, any] = await db.query(
                    'INSERT INTO sale (date, quantity, product_id, worker_id) VALUES (?, ?, ?, ?)',
                    [date, quantity, product_id, worker_id]
                );

                // Verifica si `insertId` está disponible en la respuesta
                if (result && result.insertId) {
                    res.status(201).json({ message: 'Venta registrada con éxito', saleId: result.insertId });
                } else {
                    res.status(500).json({ error: 'No se pudo obtener el ID de la venta registrada' });
                }
            } catch (error: unknown) {
                console.error('Error al registrar la venta:', error);
                res.status(500).json({ error: 'Error al registrar la venta' });
            }
            break;

        case 'PUT':
            try {
                const { id, date, quantity, product_id, worker_id } = req.body;

                if (!id) {
                    return res.status(400).json({ error: 'Se requiere un ID para actualizar la venta' });
                }

                await db.query(
                    'UPDATE sale SET date = ?, quantity = ?, product_id = ?, worker_id = ? WHERE id = ?',
                    [date, quantity, product_id, worker_id, id]
                );

                res.status(200).json({ message: 'Venta actualizada con éxito' });
            } catch (error: unknown) {
                console.error('Error al actualizar la venta:', error);
                res.status(500).json({ error: 'Error al actualizar la venta' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;

                if (!id) {
                    return res.status(400).json({ error: 'Se requiere un ID para eliminar la venta' });
                }

                await db.query('DELETE FROM sale WHERE id = ?', [id]);
                res.status(200).json({ message: 'Venta eliminada con éxito' });
            } catch (error: unknown) {
                console.error('Error al eliminar la venta:', error);
                res.status(500).json({ error: 'Error al eliminar la venta' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
    }
}
