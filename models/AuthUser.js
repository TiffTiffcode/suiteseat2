const mongoose = require('mongoose');

const AuthUserSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: '' },
    lastName:  { type: String, default: '' },
    name:      { type: String, default: '' }, // optional display name
    roles:     { type: [String], default: [] }, // <-- keep only one roles field
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone:        { type: String },
    address:      { type: String },
    profilePhoto: { type: String },
    profileRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', default: null }
  },
  { timestamps: true, collection: 'auth_users' }
);

// keep `name` in sync if not provided
AuthUserSchema.pre('save', function (next) {
  if (!this.name) {
    const full = [this.firstName, this.lastName].filter(Boolean).join(' ').trim();
    if (full) this.name = full;
  }
  next();
});

module.exports = mongoose.models.AuthUser || mongoose.model('AuthUser', AuthUserSchema);
