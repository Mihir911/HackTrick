import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, verifyPassword } from '../utils/bcrypt.js';

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4()
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['student', 'researcher', 'instructor', 'hr', 'admin'],
        default: 'student'
    },
    password_hash: {
        type: String,
        required: true,
        select: false
    },
    xp: {
        type: Number,
        default: 0
    },
    rank: {
        type: String,
        enum: ['Rookie', 'Script Kiddie', 'Pentester', 'Red Team Lead', 'Elite Hacker', 'Sysop'],
        default: 'Rookie'
    },
    bio: {
        type: String,
        default: ''
    },
    avatar_url: {
        type: String,
        default: null
    },
    skills: {
        type: [String],
        default: []
    },
    hr_verified: {
        type: Boolean,
        default: false
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
            delete ret.password_hash;
            return ret;
        }
    }
});

//indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ xp: -1 });

userSchema.statics.hashPassword = async function(password) {
    return await hashPassword(password);
};

//instance method
userSchema.methods.comparePassword = async function (password) {
    return await verifyPassword(password, this.password_hash);
};

//update rank based on XP
userSchema.methods.updateRank = function(){
    const xp = this.xp;
    if (xp >= 2000) this.rank = 'Elite Hacker';
    else if (xp >= 1000) this.rank = 'Red Team Lead';
    else if (xp >= 500) this.rank = 'Pentester';
    else if (xp >= 200) this.rank = 'Script Kiddie';
    else this.rank = 'Rookie';
    return this.rank;
};

//pre-save hook to update rank
userSchema.pre('save', function (next) {
    if (this.isModified('xp')) {
        this.updateRank();
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;