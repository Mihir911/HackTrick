import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const offerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    hr_id: {
        type: String,
        required: true,
        index: true
    },
    hr_name: {
        type: String,
        required: true
    },
    candidate_id: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['full_time', 'part_time', 'contract', 'internship'],
        default: 'full_time'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    compensation: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['sent', 'viewed', 'accepted', 'rejected'],
        default: 'sent'
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

offerSchema.index({ hr_id: 1, created_at: -1 });
offerSchema.index({ candidate_id: 1, created_at: -1 });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;