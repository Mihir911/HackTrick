import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const chatSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    hackathon_id: {
        type: String,
        required: true,
        index: true
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
    }
}, {
    timestamps: {
        createdAt: 'created_at'
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
chatSchema.index({ hackathon_id: 1, created_at: -1 });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;