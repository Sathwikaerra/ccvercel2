import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from "cors";
import UserRouter from './routes/userRoutes.js';
import AdminRouter from './routes/adminRoutes.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer';
import User from './models/userModel.js'
import Admin from './models/adminModel.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Use fileURLToPath and dirname to get the current directory (equivalent of __dirname in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/user', UserRouter);
app.use('/admin', AdminRouter);

const OTP_LENGTH = 6; // OTP length

// Generate OTP function
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Generates a 6-digit OTP
};

// Store OTP temporarily (for simplicity, using an in-memory store)
let otpStore = {};

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any email provider you use (e.g., 'smtp.mailtrap.io' for development)
  auth: {
    user: process.env.EMAIL_USER, // Your email address (example: 'your-email@gmail.com')
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Send OTP via email using Nodemailer
const sendOTPviaEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Receiver address
      subject: 'Your OTP Code', // Subject of the email
      text: `Your OTP code is: ${otp}`, // OTP message body
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP sent via email');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};
const sendOTPviaEmail1 = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Receiver address
      subject: 'You have a food parcel request', // Updated subject
      html: `
        <p>You have a new food parcel request.</p>
        <p>Please check the dashboard to confirm your opinion on the order.</p>
       
      `, // Basic HTML body with a single image
      // attachments: [
      //   {
      //     filename: 'CC2.jpg',
      //     path: path.join(__dirname, 'public/CC2.jpg'), // Path to the image file
      //     cid: 'foodImage', // Content-ID for embedding the image
      //   },
      // ],
    };
    

    await transporter.sendMail(mailOptions);
    console.log('OTP sent via email');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};


// const requestPending=async(userId)=>{
//   const user = await User.findOne({ _id: userId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Set the requestPending to true when OTP is sent
//     user.requestPending = true;
//     await user.save();

// }


// API to send OTP to active user (via email)
app.post('/user/send-otp/:userId', (req, res) => {
  const { userId } = req.params;
  const { email,id } = req.body; // Get email from request body
  // User's email address

  // Generate OTP
  const otp = generateOTP();


  // Save OTP temporarily (you can use a database or Redis in production)
  otpStore[userId] = { otp, expiresAt: Date.now() + 300000 }; // OTP expires in 5 minutes

  // Send OTP via email
  sendOTPviaEmail1(email, otp)
    .then(async() => {
      await User.findByIdAndUpdate(id, { requestPending: true });
     
      res.status(200).json({ message: 'OTP sent successfully to email' });
      
      
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to send OTP via email' });
    });
});
// API to verify OTP
app.post('/user/verify-otp/:userId', async (req, res) => {
  const { userId } = req.params;
  const { otp } = req.body;

  // Retrieve stored OTP
  const storedOTP = otpStore[userId];

  if (!storedOTP) {
    return res.status(400).json({ error: 'OTP not sent or expired' });
  }

  // Check if OTP is expired
  if (Date.now() > storedOTP.expiresAt) {
    delete otpStore[userId]; // Clear expired OTP
    return res.status(400).json({ error: 'OTP has expired' });
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ error: "User not found." });
  }

  // Verify the OTP
  if (storedOTP.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  // Clear OTP after verification
  delete otpStore[userId];

  // Check if there are any pending requests
  if (user.orderRequest.length === 0) {
    return res.status(400).json({ error: "No pending requests found." });
  }

  // Step 1: Handle the requests that are pending
  const updatedOrderRequests = [];
  for (let request of user.orderRequest) {
    if (request.status === "pending") {
      // Update the request status to 'approved'
      request.status = 'approved';
      
      // Update the `request` field of the user who made the request
      const requestedUser = request.requestedBy;

      // Update the `request` field for the requested user
      await User.findByIdAndUpdate(requestedUser._id, { $set: { request: true } });
    }

    // Add the request to the updated array
    updatedOrderRequests.push(request);
  }

  // Step 2: Update the user document with the modified `orderRequest` array
  await user.updateOne({ orderRequest: updatedOrderRequests });

  // Step 3: Return success response
  return res.status(200).json({ message: 'OTP verified successfully and requests updated.' });
});

// API to send OTP (for testing, simplified)
// let otpStore1={};
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 300000 };
    // console.log(otpStore) // OTP expires in 5 minutes

    await sendOTPviaEmail(email, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// API to verify OTP (for testing, simplified)
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedOTP = otpStore[email];


  if (!storedOTP) {
    return res.status(400).json({ error: 'OTP not sent or expired' });
  }

  // Check if OTP is expired
  if (Date.now() > storedOTP.expiresAt) {
    delete otpStore[email]; // Clear expired OTP
    return res.status(400).json({ error: 'OTP has expired' });
  }

  // Verify OTP
  if (storedOTP.otp === otp) {
    delete otpStore[email]; // Clear OTP after verification
    return res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
});


app.post('/suggestions/send-email', async (req, res) => {
  const { suggestion,userEmail,userName } = req.body;
  // console.log(userEmail)

  // console.log(process.env.EMAIL_USER)

  try {
    const transporter1 = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address (example: 'your-email@gmail.com')
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions1 = {
      from: process.env.EMAIL_USER, // Your email address
      to: process.env.EMAIL_USER,   // Your email address (recipient)
      replyTo: userEmail,           // Set the reply-to address to the user's email
      subject: `Contact Form Submission from ${userEmail} ${userName}`,
      html: `<p>Hi, I am ${userName} with email ${userEmail} and my suggestion is: <strong>${suggestion}</strong></p>`,
    };
    
    

    await transporter1.sendMail(mailOptions1);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post('/reset-password', async (req, res) => {
  const { resetToken, email, newPassword } = req.body;
  // console.log(resetToken,email,newPassword)
  if(newPassword.length<5)
    {
      return res.status(403).json({ message: 'password must have atleast 6 characters' });

    }else{

    

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // console.log('1')
      return res.status(404).json({ message: 'User not found' });
    }
   


    // Check if the reset token is valid and hasn't expired
    if (user.resetPasswordToken !== resetToken) {
      // console.log('2')
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      // console.log('3')
      return res.status(400).json({ message: 'Token has expired' });
    }
    

    // Token is valid, so let's update the password
    user.password = await bcrypt.hash(newPassword, 10);
    // console.log('5') // Hash the new password
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the reset expiration time
    await user.save();
    // console.log('4')

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
}
});

app.post('/admins/reset-password', async (req, res) => {
  const { resetToken, email, newPassword } = req.body;
  // console.log(resetToken,email,newPassword)
  if(newPassword.length<5)
    {
      return res.status(403).json({ message: 'password must have atleast 6 characters' });

    }else{

    

  try {
    // Find the user by email
    const user = await Admin.findOne({ email });
    if (!user) {
      // console.log('1')
      return res.status(404).json({ message: 'Admin not found' });
    }
   


    // Check if the reset token is valid and hasn't expired
    if (user.resetPasswordToken !== resetToken) {
      // console.log('2')
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      // console.log('3')
      return res.status(400).json({ message: 'Token has expired' });
    }
    

    // Token is valid, so let's update the password
    user.password = await bcrypt.hash(newPassword, 10);
    // console.log('5') // Hash the new password
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the reset expiration time
    await user.save();
    // console.log('4')

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
}
});


app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // console.log(email);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    // console.log(resetToken);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    // console.log(user);

    // Instead of emailing the token, return it as a response
    res.status(200).json({ 
      message: 'Password reset token generated successfully.', 
      resetToken: resetToken // Send the token back to the frontend
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
});


app.post('/admins/forgot-password', async (req, res) => {
  const { email } = req.body;

  // console.log(email);
  try {
    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Admin not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    // console.log(resetToken);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    // console.log(user);

    // Instead of emailing the token, return it as a response
    res.status(200).json({ 
      message: 'Password reset token generated successfully.', 
      resetToken: resetToken // Send the token back to the frontend
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
});

// Connect to MongoDB and start the server
try {
  mongoose.connect(process.env.MONGO_URL).then(() => {
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  }).catch((error) => {
    console.log(error);
  });
} catch (error) {
  console.log('Error connecting to the database');
}
