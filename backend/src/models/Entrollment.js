import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const enrollmentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    course_id: {
        type: String,
        required: true,
        index: true
    },
    user_id: {
        type: String,
        required: true,
        index: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    completed_lessons: {
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

// Compound index for unique enrollment
enrollmentSchema.index({ course_id: 1, user_id: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;