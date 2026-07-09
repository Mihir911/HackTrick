import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const fileSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    owner_id: {
        type: String,
        required: true,
        index: true
    },
    storage_path: {
        type: String,
        required: true,
        unique: true
    },
    original_filename: {
        type: String,
        required: true
    },
    content_type: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

fileSchema.index({ storage_path: 1 });
fileSchema.index({ owner_id: 1, is_deleted: 1 });

const File = mongoose.model('File', fileSchema);
export default File;