const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Mock upload endpoint
  router.post('/', async (req, res) => {
    try {
      // In real implementation, upload to Azure Blob Storage
      res.json({
        message: 'File uploaded successfully (mock)',
        url: 'https://example.blob.core.windows.net/images/product.jpg'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
