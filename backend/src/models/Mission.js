import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const missionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    order: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    xp: {
        type: Number,
        required: true
    },
    brief: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        required: true,
        select: false
    },
    category: {
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
            delete ret.flag;
            return ret;
        }
    }
});

// Indexes
missionSchema.index({ order: 1 });
missionSchema.index({ difficulty: 1 });
missionSchema.index({ category: 1 });

const Mission = mongoose.model('Mission', missionSchema);
export default Mission;