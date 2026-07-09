import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const videoSchema = new mongoose.Schema({
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
    owner_name: {
        type: String,
        required: true
    },
    owner_role: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    video_type: {
        type: String,
        enum: ['long', 'short'],
        default: 'long'
    },
    tags: {
        type: [String],
        default: []
    },
    external_url: {
        type: String,
        default: null
    },
    storage_path: {
        type: String,
        default: null
    },
    thumbnail_url: {
        type: String,
        default: null
    },
    duration_sec: {
        type: Number,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: [String],
        default: []
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

// Indexes
videoSchema.index({ owner_id: 1 });
videoSchema.index({ created_at: -1 });
videoSchema.index({ video_type: 1 });
videoSchema.index({ tags: 1 });

const Video = mongoose.model('Video', videoSchema);
export default Video;