import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    id: {
      type: String,
      required: true,
      unique:true,
      trim: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    request: {
      type: Boolean,
      default: false, // Indicates whether a request is made
    },
    requestPending: {
      type: Boolean,
      default: false, // New field for tracking request pending status
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // Default status is 'pending'
    },
    active: {
      type: Boolean,
      default: false,
    },
    serviceCount: {
      type: Number,
      default: 5,
    },
    accessedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference the User model
        },
        count: {
          type: Number,
          default: 0, // Default count is 0
        },
      },
    ],
    // Tracks incoming requests
    orderRequest: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the user who requested the service
        },
        serviceCount: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending', // Default status is 'pending'
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Tracks outgoing requests made by this user
    requestedTo: [
      {
        userDetails: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the user being requested
        },
        count: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending', // Default status is 'pending'
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', UserSchema);
