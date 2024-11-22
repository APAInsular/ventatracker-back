import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

// Inicializa el middleware de CORS
const cors = Cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    origin: ['http://localhost:3001'],                   // Origen permitido
    allowedHeaders: ['Content-Type', 'Authorization'],   // Cabeceras permitidas
});

// Helper para ejecutar el middleware
function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: (req: NextApiRequest, res: NextApiResponse, next: (err?: unknown) => void) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: unknown) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve();
        });
    });
}

// Middleware de CORS para usar en las rutas de la API
export default async function corsMiddleware(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    await runMiddleware(req, res, cors);
}