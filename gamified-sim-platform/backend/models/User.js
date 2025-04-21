const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    completedAssignments: {
        type: [String], // Array of assignment IDs
        default: []
    },
    submissionHistory: [
        {
            assignmentId: String,
            userId: String,
            submittedAt: Date,
            isCorrect: Boolean,
            score: Number,
            userCode: String,
            result: mongoose.Schema.Types.Mixed, // ✅ allows any type (string, object, array, etc.),
        }
    ]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);