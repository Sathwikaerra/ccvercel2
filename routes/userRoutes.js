import express from 'express';
import User from '../models/userModel.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { signup,getOtherRequestUsers,checkRequest,OtherUpdateRequest,OtherRemoveAccessedBy,OtherRejectRequest,OtherApproveRequest,getOtherUser, deleteOtherRequestFromRequestedTo,getOtherServiceUsers, login,getUser,updateStatus,updateOtherStatus,getUser1,updateUserPassword,deleteRequestFromRequestedTo,approveRequest,rejectRequest,resetParcels,getAllUsers,getActiveUsers,updateRequest,updateCount,removeAccessedBy, getRequestUsers, verifySignup,getResquestTo } from '../controllers/userController.js';

const UserRouter = express.Router();
dotenv.config()



 // Load environment variables from .env file

// Create Nodemailer transporter using the environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail service (you can change this if using another email service)
  auth: {
    user: process.env.EMAIL_USER, // Email address from .env file
    pass: process.env.EMAIL_PASS, // App password or regular password
  },
});

UserRouter.post("/Alert/send-email", async (req, res) => {
  const { email, subject, message } = req.body;
  // console.log(email,subject,message)

  // Validate input fields
  if (!email || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to: email, // Recipient email
      subject: subject, // Email subject
      html: `<p>${message}</p>
            <p>Best Regards,</p>
      <p><strong>Campus Connect</strong></p>`, // HTML content (can also use text for plain text)
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:");
    res.status(500).json("Failed to send email." );
  }
});

// Routes for user signup and login]
UserRouter.delete('/:userId/request/:index', deleteRequestFromRequestedTo);
UserRouter.delete('/other/:userId/request/:index', deleteOtherRequestFromRequestedTo);

UserRouter.get('/requestedTo/:userId',getResquestTo)
UserRouter.post('/signup', signup);
UserRouter.post('/verifysignup', verifySignup);

UserRouter.post('/approve-request/:userId', approveRequest);
UserRouter.post('/other/approve-request/:userId', OtherApproveRequest);

UserRouter.delete('/remove-request/:userId', rejectRequest);
UserRouter.delete('/other/remove-request/:userId', OtherRejectRequest);
UserRouter.delete('/remove-accessed-by/:userId', removeAccessedBy);
UserRouter.delete('/other/remove-accessed-by/:userId', OtherRemoveAccessedBy);

UserRouter.put('/reset-parcels/:userId', resetParcels);
UserRouter.get('/',getActiveUsers)
UserRouter.get('/other',getOtherServiceUsers)
UserRouter.get('/allusers',getAllUsers)
UserRouter.post('/login', login);
UserRouter.get('/:userId',getUser)
UserRouter.get('/cart/:currentUserId',getUser1)

UserRouter.get('/other/cart/:currentUserId',getOtherUser)


UserRouter.post('/request/check/:userId',checkRequest)

UserRouter.put('/update-status',updateStatus)
UserRouter.put('/other-status',updateOtherStatus)
UserRouter.put('/update-request',updateRequest) 
UserRouter.put('/other/update-request',OtherUpdateRequest) 


UserRouter.get('/get/requsers',getRequestUsers)
UserRouter.get('/get/other-requsers',getOtherRequestUsers)


UserRouter.put('/update-password/:userId',updateUserPassword)
UserRouter.put('/updateCount/:userId',updateCount)
UserRouter.delete('/remove-accessed-by/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(userId)
    const {index,delCount} = req.body;
    console.log(index)  // The ID of the accessedBy entry to be deleted
  
    try {
      // Find the user by ID
      const user = await User.findById(userId);
      console.log(user)
      
      // Remove the accessedBy entry
      user.accessedBy = user.accessedBy.filter((_,item) => item !== index);
      user.serviceCount=user.serviceCount+delCount;
      console.log(user.accessedBy)
      
  
      // Save the updated user
      await user.save();
     
  
      res.status(200).json({ message: 'Access removed successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to remove access' });
    }
  });

  UserRouter.put('/reset/:userId',async(req,res)=>{
    const { userId } = req.params;
    
    try {
        // Find the user by ID
        const user = await User.findById(userId);
            
        user.serviceCount=5;
        user.accessedBy=[];
        user.orderRequest=[];
        user.result='pending';

        
    
        // Save the updated user
        await user.save();
       
    
        res.status(200).json({ message: ' resetted successfully' });
      } catch (err) {
        res.status(500).json({ message: 'Failed to reset' });
      }
    });

    UserRouter.post('/save-user', async (req, res) => {
      const { phoneNumber, id,password } = req.body;
    
      try {
        // Check if the user already exists
        let user = await User.findOne({ phoneNumber });
        if (!user) {
          // Create a new user if not exists
          user = new User({
            phoneNumber,
            userId,
            // Add additional fields here
          });
          await user.save();
        }
    
        res.status(200).json({ message: 'User data saved successfully!', user });
      } catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).json({ error: 'Failed to save user data.' });
      }
    });

    
    UserRouter.put('/other/set-order-request/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { requestedBy, status,identifier,phoneNumber} = req.body;

        // console.log(requestedBy,serviceCount,status)
    
        // Find the user to whom the request is being made
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }
    
        // Find the user who is making the request
        const requester = await User.findById(requestedBy);
        if (!requester) {
          return res.status(404).send({ message: 'Requesting user not found' });
        }

        console.log(2);
    
        // Ensure the orderRequest field is an array for the user
        if (!Array.isArray(user.OtherOrderRequest)) {
          user.OtherOrderRequest = [];
        }
    
        // Ensure the requestedTo field is an array for the requester
        if (!Array.isArray(requester.OtherRequestedTo)) {
          requester.OtherRequestedTo = [];
        }
     
        // Add the order request to the user's orderRequest array
        const orderRequestEntry = {
          requestedBy, // The user who is requestin // Number of services requested
          status,
          identifier,
          phoneNumber, // Status of the order (pending, approved, rejected)
          createdAt: new Date(),
        };
        user.OtherOrderRequest.push(orderRequestEntry);
        // console.log('3')
    
        // Add the request to the requester's requestedTo array
        const requestedToEntry = {
          userDetails: userId, // The user being requested // Number of services requested
          status,
          identifier,
          phoneNumber, // Status of the request (pending, approved, rejected)
          createdAt: new Date(),
        };
        console.log(4)
        requester.OtherRequestedTo.push(requestedToEntry);
        console.log(5)
    
        // Save both users
        await user.save();
        await requester.save();

        console.log(6)

    
        res.status(200).send({
          message: 'Order request and requestedTo updated successfully',
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to update order request' });
      }
    });
    
    UserRouter.put('/set-order-request/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { requestedBy, serviceCount, status,identifier,phoneNumber } = req.body;
        // console.log(phoneNumber)

        // console.log(requestedBy,serviceCount,status)
    
        // Find the user to whom the request is being made
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }
    
        // Find the user who is making the request
        const requester = await User.findById(requestedBy);
        if (!requester) {
          return res.status(404).send({ message: 'Requesting user not found' });
        }

        console.log(2);
    
        // Ensure the orderRequest field is an array for the user
        if (!Array.isArray(user.orderRequest)) {
          user.orderRequest = [];
        }
    
        // Ensure the requestedTo field is an array for the requester
        if (!Array.isArray(requester.requestedTo)) {
          requester.requestedTo = [];
        }
     
        // Add the order request to the user's orderRequest array
        const orderRequestEntry = {
          requestedBy, // The user who is requesting
          serviceCount, // Number of services requested
          status,
          identifier,
          phoneNumber, // Status of the order (pending, approved, rejected)
          createdAt: new Date(),
        };
        user.orderRequest.push(orderRequestEntry);
        console.log('3')
    
        // Add the request to the requester's requestedTo array
        const requestedToEntry = {
          userDetails: userId, // The user being requested
          serviceCount, // Number of services requested
          status,
          identifier,
          phoneNumber, // Status of the request (pending, approved, rejected)
          createdAt: new Date(),
        };
        console.log(4)
        requester.requestedTo.push(requestedToEntry);
        console.log(5)
    
        // Save both users
        await user.save();
        await requester.save();

        console.log(6)

    
        res.status(200).send({
          message: 'Order request and requestedTo updated successfully',
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to update order request' });
      }
    });
    


    
    
    





export default UserRouter;
