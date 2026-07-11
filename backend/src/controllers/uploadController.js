import multer from 'multer';
import { putObject } from '../config/storage.js';
import File from '../models/File.js';
import { generateId, nowIso } from '../utils/helpers.js';
import logger from '../utils/logger.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/quicktime',
            'application/pdf',
            'text/plain', 'text/markdown'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed`), false);
        }
    }
});

/**
 * Upload a file
 */
export const uploadFile = [
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const file = req.file;
            const ext = file.originalname.split('.').pop().toLowerCase() || 'bin';
            const path = `${process.env.APP_NAME || 'hacktrick'}/uploads/${req.user.id}/${generateId()}.${ext}`;

            // Upload to storage
            const result = await putObject(path, file.buffer, file.mimetype);

            // Save file metadata
            const fileDoc = new File({
                owner_id: req.user.id,
                storage_path: result.path,
                original_filename: file.originalname,
                content_type: file.mimetype,
                size: result.size || file.size,
                is_deleted: false
            });
            await fileDoc.save();

            logger.info(`File uploaded: ${result.path} by ${req.user.id}`);

            res.json({
                storage_path: result.path,
                size: result.size || file.size,
                content_type: file.mimetype,
                original_filename: file.originalname
            });
        } catch (error) {
            logger.error(`Upload error: ${error.message}`);
            res.status(500).json({ error: 'Upload failed' });
        }
    }
];

export default { uploadFile };