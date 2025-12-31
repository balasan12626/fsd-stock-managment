const express = require('express');
const upload = require('./middleware/uploadMiddleware');
const app = express();

app.post('/test-upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ file: req.file });
    });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Run this command to test:');
    console.log(`curl -F "file=@package.json" http://localhost:${PORT}/test-upload`);
});
