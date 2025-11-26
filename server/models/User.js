const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['citizen', 'advocate', 'mediator', 'arbitrator', 'notary', 'document_writer'],
      required: true
    },
    points: { type: Number, default: 0 },
    badges: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
