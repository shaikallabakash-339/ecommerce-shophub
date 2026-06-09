const express = require('express');
const router = express.Router();
const { BlobServiceClient } = require('@azure/storage-blob');
const authRoutes = require('./auth');
const { v4: uuidv4 } = require('uuid');

const verifyToken = authRoutes.verifyToken;

// Initialize Azure
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_CONTAINER_NAME || 'products'
);

// Upload product image
router.post('/image', verifyToken, async (req, res) => {
  try {
    const { file, filename } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    const blobName = `images/${Date.now()}-${uuidv4()}-${filename}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' }
    });

    const url = `${process.env.AZURE_STORAGE_URL}/${process.env.AZURE_CONTAINER_NAME}/${blobName}`;

    res.json({
      url: url,
      blobName: blobName,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('[v0] Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload product video
router.post('/video', verifyToken, async (req, res) => {
  try {
    const { file, filename } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    const blobName = `videos/${Date.now()}-${uuidv4()}-${filename}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: 'video/mp4' }
    });

    const url = `${process.env.AZURE_STORAGE_URL}/${process.env.AZURE_CONTAINER_NAME}/${blobName}`;

    res.json({
      url: url,
      blobName: blobName,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    console.error('[v0] Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Batch upload for admin
router.post('/batch', verifyToken, async (req, res) => {
  try {
    const { files } = req.body;
    
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Files array required' });
    }

    const uploadedFiles = [];

    for (const file of files) {
      try {
        const buffer = Buffer.from(file.data.split(',')[1], 'base64');
        const fileType = file.type || 'image/jpeg';
        const folder = fileType.startsWith('video') ? 'videos' : 'images';
        const blobName = `${folder}/${Date.now()}-${uuidv4()}-${file.name}`;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(buffer, buffer.length, {
          blobHTTPHeaders: { blobContentType: fileType }
        });

        const url = `${process.env.AZURE_STORAGE_URL}/${process.env.AZURE_CONTAINER_NAME}/${blobName}`;

        uploadedFiles.push({
          url: url,
          blobName: blobName,
          name: file.name,
          type: fileType
        });
      } catch (fileError) {
        console.error('[v0] Batch file upload error:', fileError);
      }
    }

    res.json({
      files: uploadedFiles,
      message: `${uploadedFiles.length} files uploaded successfully`
    });
  } catch (error) {
    console.error('[v0] Batch upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Delete file from Azure
router.delete('/:blobName', verifyToken, async (req, res) => {
  try {
    const { blobName } = req.params;
    const decodedBlobName = decodeURIComponent(blobName);

    const blockBlobClient = containerClient.getBlockBlobClient(decodedBlobName);
    await blockBlobClient.delete();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('[v0] Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get upload URL (for direct uploads)
router.get('/token/:filename', verifyToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const blobName = `uploads/${Date.now()}-${uuidv4()}-${filename}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const sasUrl = blockBlobClient.generateSasUrl({
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      permissions: 'racwd'
    });

    res.json({
      sasUrl: sasUrl,
      blobName: blobName
    });
  } catch (error) {
    console.error('[v0] Get upload token error:', error);
    res.status(500).json({ error: 'Failed to generate upload token' });
  }
});

module.exports = router;
