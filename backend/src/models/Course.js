import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const lessonSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => uuidv4()
    },
    title: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    }
}, { _id: false });

const courseSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    is_free: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        default: 0
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    tags: {
        type: [String],
        default: []
    },
    thumbnail_url: {
        type: String,
        default: null
    },
    lessons: {
        type: [lessonSchema],
        default: []
    },
    enrollment_count: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
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
courseSchema.index({ instructor_id: 1 });
courseSchema.index({ created_at: -1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ is_free: 1 });
courseSchema.index({ tags: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;