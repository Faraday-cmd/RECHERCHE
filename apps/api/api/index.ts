export default function handler(req: any, res: any) {
  const url = req.url || '';

  // Resend Inbound Email Webhook Route (/api/v1/email/webhook)
  if (url.includes('/email/webhook')) {
    if (req.method === 'GET' || req.method === 'POST') {
      return res.status(200).json({
        status: 'OK',
        message: 'Resend email received webhook endpoint active.',
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Root Backend Health Metadata Route (/api/v1)
  return res.status(200).json({
    status: 'OK',
    name: 'RECHERCHE V1 Backend API',
    version: '1.0.0-rc1',
    endpoint: url,
    timestamp: new Date().toISOString(),
  });
}
