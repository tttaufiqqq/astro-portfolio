import express from 'express';
import path from 'path';
import app from './app';

const PORT = process.env.PORT || 8080;

// Serve React frontend (production only)
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
