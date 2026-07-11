import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const endorsementSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    instructor_id: {
        type: String,
        required: true,
        index: true
    },
    instructor_name: {
        type: String,
        required: true
    },
    student_id: {
        type: String,
        required: true,
        index: true
    },
    student_name: {
        type: String,
        required: true
    },
    course_id: {
        type: String,
        default: null
    },
    note: {
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

// Indexes
endorsementSchema.index({ student_id: 1, created_at: -1 });
endorsementSchema.index({ instructor_id: 1, created_at: -1 });

const Endorsement = mongoose.model('Endorsement', endorsementSchema);
export default Endorsement;