const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Azure Blob Storage connection
const getBlobClient = async () => {
  const connectionString = `DefaultEndpointsProtocol=https;AccountName=${process.env.AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${process.env.AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`;
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);
};

// Upload single image
router.post('/image', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const containerClient = await getBlobClient();
    const blobName = `images/${Date.now()}-${uuidv4()}${path.extname(req.file.originalname)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(req.file.buffer, req.file.buffer.length, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const url = `${process.env.AZURE_ENDPOINT}/${process.env.AZURE_CONTAINER_NAME}/${blobName}`;

    res.json({
      success: true,
      url,
      fileName: blobName,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload video
router.post('/video', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const containerClient = await getBlobClient();
    const blobName = `videos/${Date.now()}-${uuidv4()}${path.extname(req.file.originalname)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(req.file.buffer, req.file.buffer.length, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const url = `${process.env.AZURE_ENDPOINT}/${process.env.AZURE_CONTAINER_NAME}/${blobName}`;

    res.json({
      success: true,
      url,
      fileName: blobName,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple files
router.post('/batch', verifyToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const containerClient = await getBlobClient();
    const uploads = [];

    for (const file of req.files) {
      const blobName = `uploads/${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(file.buffer, file.buffer.length, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
      });

      const url = `${process.env.AZURE_ENDPOINT}/${process.env.AZURE_CONTAINER_NAME}/${blobName}`;
      
      uploads.push({
        url,
        fileName: blobName,
        originalName: file.originalname
      });
    }

    res.json({
      success: true,
      files: uploads
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
