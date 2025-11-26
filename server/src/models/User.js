const { Schema, model } = require('mongoose');

const userSchema = new Schema(
	{
		fullName: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		mobile: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		role: {
			type: String,
			enum: ['ADVOCATE', 'ARBITRATOR', 'MEDIATOR', 'NOTARY', 'DOCUMENT_WRITER', 'CITIZEN', 'ADMIN'],
			default: 'CITIZEN',
		},
		providerMeta: {
			enrollmentNumber: String,
			barCouncil: String,
			yearsOfExperience: Number,
			specializations: [String],
			verified: { type: Boolean, default: false },
		},
		ratings: {
			average: { type: Number, default: 0 },
			count: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
);

module.exports = model('User', userSchema);






