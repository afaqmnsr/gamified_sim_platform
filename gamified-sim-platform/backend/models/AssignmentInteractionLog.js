const mongoose = require('mongoose');

const AssignmentInteractionLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: String, required: false },
    action: { type: String, enum: ['start', 'submit', 'code_metrics', 'run_algorithm', 'code_change'], required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} },
});

module.exports = mongoose.model('AssignmentInteractionLog', AssignmentInteractionLogSchema);
