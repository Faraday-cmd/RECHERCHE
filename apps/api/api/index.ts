import express from 'express';

const app: express.Express = express();

app.use(express.json());

app.get('/api/v1', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    name: 'RECHERCHE V1 Backend API',
    message: 'Vercel Serverless Function active and healthy.',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/v1/email/webhook', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Resend email received webhook endpoint ready.',
    timestamp: new Date().toISOString(),
  });
});

app.all('*', (req, res) => {
  res.status(200).json({
    status: 'OK',
    name: 'RECHERCHE V1 Backend API',
    path: req.url,
    timestamp: new Date().toISOString(),
  });
});

export default function handler(req: any, res: any) {
  app(req, res);
}
