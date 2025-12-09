const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xml2js = require('xml2js');

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('svg'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const svgText = req.file.buffer.toString('utf-8');

    // Check for query parameter (?format=json)
    if (req.query.format === 'json') {
        try {
            // Parse the SVG XML to JSON
            const result = await xml2js.parseStringPromise(svgText, {
                explicitArray: false, // cleaner output
                mergeAttrs: true,     // merge element attributes into the object
            });
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: 'Invalid SVG/XML format', details: err.toString() });
        }
    } else {
        // Default: return plain SVG text
        res.type('text/plain').send(svgText);
    }
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));