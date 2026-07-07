const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // Unique, collision-free name without relying on Date.now inside this module's callers
        const unique = `${req.user._id}-${process.hrtime.bigint()}${path.extname(file.originalname)}`;
        cb(null, unique);
    }
});

// Only allow images and PDFs, cap at 5MB
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, WEBP images or PDF files are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// @route   POST /api/upload
// @desc    Upload a single supporting document/photo
// @access  Private
router.post('/', protect, (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided.' });
        }
        // Relative URL — served by express.static and proxied by Vite in dev
        res.status(201).json({ url: `/uploads/${req.file.filename}` });
    });
});

module.exports = router;
