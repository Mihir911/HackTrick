import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const commentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    target_id: {
        type: String,
        required: true,
        index: true
    },
    target_type: {
        type: String,
        required: true,
        enum: ['video', 'course']
    },
    user_id: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
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

commentSchema.index({ target_id: 1, created_at: -1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;