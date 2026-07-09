import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const challengeSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => uuidv4()
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        required: true
    }
}, { _id: false });

const participantSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['online', 'offline'],
        default: 'online'
    },
    joined_at: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const hackathonSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    creator_id: {
        type: String,
        required: true
    },
    creator_name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    challenges: {
        type: [challengeSchema],
        default: []
    },
    participants: {
        type: [participantSchema],
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
            // Remove flags from challenges when sending to client
            if (ret.challenges) {
                ret.challenges = ret.challenges.map(ch => {
                    const { flag, ...rest } = ch;
                    return rest;
                });
            }
            ret.participant_count = ret.participants ? ret.participants.length : 0;
            return ret;
        }
    }
});

// Indexes
hackathonSchema.index({ start_time: -1 });
hackathonSchema.index({ end_time: 1 });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);
export default Hackathon;