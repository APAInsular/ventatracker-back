import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.status(200).json(rows);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
      }
      break;

    case 'PUT':
      try {
        const { id, name, price, description } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Se requiere un ID para actualizar el producto' });
        }

        await pool.query('UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?', [name, price, description, id]);
        res.status(200).json({ message: 'Producto actualizado con éxito' });
      } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Se requiere un ID para eliminar el producto' });
        }

        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        res.status(200).json({ message: 'Producto eliminado con éxito' });
      } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
