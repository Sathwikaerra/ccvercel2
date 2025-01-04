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
      unique:true,
      required: true,
    },
    OtherRequest: {
      type: Boolean,
      default: false, // Indicates whether a request is made
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
      // enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // Default status is 'pending'
    },
    otherServices:{
      type: Boolean,
      default:false,
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
        phoneNumber:{
          type:Number,
          default:0
        }
        ,
        count: {
          type: Number,
          default: 0, // Default count is 0
        },
      },
    ],
    OtherAccessedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference the User model
        },
        phoneNumber:{
          type:Number,
          default:0
        }
      },
    ],
    // Tracks incoming requests
    orderRequest: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the user who requested the service
        },
        identifier:{
          type:String,
          default:0
          
        },
        serviceCount: {
          type: Number,
          required: true,
        },
        phoneNumber:{
          type:Number,
          default:0
        },
       
        status: {
          type: String,
          // enum: ['pending', 'approved', 'rejected'],
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
    OtherOrderRequest: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the user who requested the service
        },
        identifier:{
          type:String,
          default:0
          
        },
        phoneNumber:{
          type:Number,
          default:0
        },
      
       
        status: {
          type: String,
          // enum: ['pending', 'approved', 'rejected'],
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
        userDetails: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        serviceCount:{type:Number,default:0},
        _id: { type: mongoose.Schema.Types.ObjectId, index: true },
        status: { type: String, default: "pending" },
        identifier:{
          type:String,
          default:0
          
        },
        phoneNumber:{
          type:Number,
          default:0
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
    OtherRequestedTo: [
      {
        userDetails: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        _id: { type: mongoose.Schema.Types.ObjectId, index: true },
        status: { type: String, default: "pending" },
        identifier:{
          type:String,
          default:0
          
        },
        phoneNumber:{
          type:Number,
          default:0
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
