import multer from 'multer';
import xml2js from 'xml2js';

const upload = multer({ storage: multer.memoryStorage() });

// Convert multer middleware for serverless
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false, // Important! We need raw multipart
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await runMiddleware(req, res, upload.single('svg'));

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const svgText = req.file.buffer.toString('utf-8');

  if (req.query.format === 'json') {
    try {
      const result = await xml2js.parseStringPromise(svgText, {
        explicitArray: false,
        mergeAttrs: true,
      });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid SVG/XML format',
        details: err.toString(),
      });
    }
  }

  res.setHeader('Content-Type', 'text/plain');
  return res.send(svgText);
}
