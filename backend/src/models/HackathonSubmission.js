import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const hackathonSubmissionSchema = new mongoose.Schema({
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
    challenge_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true,
        index: true
    },
    user_name: {
        type: String,
        required: true
    },
    flag_submitted: {
        type: String,
        required: true
    },
    solved: {
        type: Boolean,
        default: false
    },
    points: {
        type: Number,
        default: 0
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
hackathonSubmissionSchema.index(
    { hackathon_id: 1, user_id: 1, challenge_id: 1 },
    { unique: true, partialFilterExpression: { solved: true } }
);
hackathonSubmissionSchema.index({ hackathon_id: 1, solved: 1 });

const HackathonSubmission = mongoose.model('HackathonSubmission', hackathonSubmissionSchema);
export default HackathonSubmission;