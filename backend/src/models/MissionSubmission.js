import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const missionSubmissionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    mission_id: {
        type: String,
        required: true,
        index: true
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

// Compound index for tracking solved missions
missionSubmissionSchema.index(
    { mission_id: 1, user_id: 1, solved: 1 },
    { partialFilterExpression: { solved: true } }
);

const MissionSubmission = mongoose.model('MissionSubmission', missionSubmissionSchema);
export default MissionSubmission;