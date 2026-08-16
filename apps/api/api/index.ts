export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'OK',
    name: 'RECHERCHE V1 Backend API',
    message: 'Vercel Serverless Function is active and healthy.',
    endpoint: req.url,
    timestamp: new Date().toISOString(),
  });
}
