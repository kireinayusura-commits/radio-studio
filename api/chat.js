import { createServer } from 'http';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // リクエストボディを手動で読み込み（サイズ上限を緩和）
  let body = '';
  try {
    await new Promise((resolve, reject) => {
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', resolve);
      req.on('error', reject);
    });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to read request body' });
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(parsed),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: {
    bodyParser: false,    // Next.jsのデフォルトパーサーを無効化
    responseLimit: false, // レスポンスサイズ制限を無効化
  },
};
