import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


 // For verifying Google tokens


 export const getUser=async(req,res,next)=>{
    const userId=req.params.userId;

     
let newuser;


try {
 newuser= await User.findById(userId).populate('orderRequest.requestedBy', 'name email status requestPending request phoneNumber') // Populate requestedBy with specific fields
 .populate('accessedBy.user', 'name email phoneNumber')
 .populate('requestedTo.userDetails','name email status count')
 .populate('OtherOrderRequest.requestedBy', 'name email status  phoneNumber')
 .populate('OtherAccessedBy.user', 'name email phoneNumber')
 .populate('OtherRequestedTo.userDetails','name email status ') // Populate the user field inside accessedBy
 .exec();
      
  
} catch (error) {
    return next(error)
    
}

if(!newuser)
    {
        res.status(500).json({message:"something went wrong "})
    }

    res.status(200).json({newuser})
}

 //import mongoose from "mongoose";
 // Update the path as necessary
 export const checkRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID(s) provided.",
      });
    }

    // Find the current user
    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Current user not found.",
      });
    }

    // Check if the current user has already requested the userId in the OtherRequestedTo array
    const requestToUpdate = user.OtherRequestedTo.find((req) => req.userDetails.toString() === userId);

    if (requestToUpdate) {
      // If a request exists, return success with message
      return res.status(200).json({
        success: true,
        alreadyRequested: true,
        message: "Request already exists for this user.",
      });
    } else {
      // If no request exists
      return res.status(200).json({
        success: true,
        alreadyRequested: false,
        message: "No existing request found for this user.",
      });
    }
  } catch (error) {
    console.error("Error checking request existence:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking the request existence.",
    });
  }
};


export const getOtherUser=async(req,res,next)=>{
  const userId=req.params.currentUserId;

   
let newuser;


try {
newuser= await User.findById(userId).populate('OtherOrderRequest.requestedBy', 'name email status phoneNumber') // Populate requestedBy with specific fields
.populate('OtherAccessedBy.user', 'name email phoneNumber')
.populate('OtherRequestedTo.userDetails','name email status ') // Populate the user field inside accessedBy
.exec();
    

} catch (error) {
  return next(error)
  
}

if(!newuser)
  {
      res.status(500).json({message:"something went wrong "})
  }

  res.status(200).json({newuser})
}




export const getUser1=async(req,res,next)=>{
  const userId=req.params.currentUserId;

   
let newuser;


try {
newuser= await User.findById(userId).populate('orderRequest.requestedBy', 'name email status requestPending request phoneNumber') // Populate requestedBy with specific fields
.populate('accessedBy.user', 'name email phoneNumber')
.populate('requestedTo.userDetails','name email status count') // Populate the user field inside accessedBy
.exec();
    

} catch (error) {
  return next(error)
  
}

if(!newuser)
  {
      res.status(500).json({message:"something went wrong "})
  }

  res.status(200).json({newuser})
}


   

export const signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, id } = req.body;

    // Validate inputs
    if (!name || !email || !password || !phoneNumber || !id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // console.log("Received signup request with:", req.body);

    // Check if the user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if the user ID already exists
    const existingId = await User.findOne({ id });
    if (existingId) {
      // console.log("ID already exists");
      return res.status(401).json({ message: 'ID already exists' });
    }
    const existingNumber = await User.findOne({ phoneNumber });
    if (existingNumber) {
      // console.log("ID already exists");
      return res.status(404).json({ message: 'mobile Number already exists' });
    }


    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      id,
    });


    await newUser.save();
    // console.log("User created successfully");
    res.status(200).json({ message: 'User created successfully', newUser });
  } catch (error) {
    // console.error("Error creating user:", error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};



export const verifySignup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, id } = req.body;

    // Validate inputs
    if (!name || !email || !password || !phoneNumber || !id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // console.log("Received signup request with:", req.body);

    // Check if the user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if the user ID already exists
    const existingId = await User.findOne({ id }); 
    if (existingId) {
      // console.log("ID already exists");
      return res.status(401).json({ message: 'ID already exists' });
    }
    const existingNumber = await User.findOne({ phoneNumber });
    if (existingNumber) {
      // console.log("ID already exists");
      return res.status(404).json({ message: 'mobile Number already exists' });
    }


    // // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // // Create a new user
    // const newUser = new User({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   phoneNumber,
    //   id,
    // });

    // await newUser.save();
    // console.log("User created successfully");
    res.status(200).json({ message: 'No user found you can proceed successfully'});
  } catch (error) {
    // console.error("Error creating user:", error);
    res.status(500).json({ message: 'Error in verifying', error });
  }
};




export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email,password)

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', newUser:user });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};


export const updateOtherStatus = async (req, res) => {
  const { id, activeStatus } = req.body;

  // Validate the input
  if (typeof activeStatus !== 'boolean') {
      return res.status(400).json({ message: 'Active status must be a boolean value' });
  }

  try {
      // Find the user by id (or email, depending on your requirement)
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Update the active status
      user.otherServices = activeStatus;

      // Save the updated user
      await user.save();

      return res.status(200).json({ message: 'User status updated successfully', user });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating user status', error });
  }
};





export const updateStatus = async (req, res) => {
    const { id, activeStatus } = req.body;

    // Validate the input
    if (typeof activeStatus !== 'boolean') {
        return res.status(400).json({ message: 'Active status must be a boolean value' });
    }

    try {
        // Find the user by id (or email, depending on your requirement)
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the active status
        user.active = activeStatus;

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: 'User status updated successfully', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating user status', error });
    }
};


export const updateRequest = async (req, res) => {
    const { id, RequestStatus } = req.body;

    // Validate the input
    if (typeof RequestStatus !== 'boolean') {
        return res.status(400).json({ message: 'Active status must be a boolean value' });
    }

    try {
        // Find the user by id (or email, depending on your requirement)
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the active status
        user.request = RequestStatus;

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: 'User status updated successfully', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating user status', error });
    }
};



export const OtherUpdateRequest = async (req, res) => {
  const { id, RequestStatus } = req.body;

  // Validate the input
  if (typeof RequestStatus !== 'boolean') {
      return res.status(400).json({ message: 'Active status must be a boolean value' });
  }

  try {
      // Find the user by id (or email, depending on your requirement)
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Update the active status
      user.OtherRequest = RequestStatus;

      // Save the updated user
      await user.save();

      return res.status(200).json({ message: 'User status updated successfully', user });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating user status', error });
  }
};


export const getOtherServiceUsers = async (req, res) => {
  try {
      // Find all users with active status set to true
      const activeUsers = await User.find({ otherServices: true });

      // If no active users are found
      if (activeUsers.length === 0) {
          return res.status(404).json({ message: 'No active users found' ,users:{}});
      }

      // Return the active users
      return res.status(200).json({ users: activeUsers });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error retrieving active users', error });
  }
};



export const getActiveUsers = async (req, res) => {
    try {
        // Find all users with active status set to true
        const activeUsers = await User.find({ active: true });

        // If no active users are found
        if (activeUsers.length === 0) {
            return res.status(404).json({ message: 'No active users found' ,users:{}});
        }

        // Return the active users
        return res.status(200).json({ users: activeUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving active users', error });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        // Find all users with active status set to true
        const activeUsers = await User.find({}).populate('accessedBy.user', 'name email phoneNumber')
        .populate('requestedTo.userDetails','name email status');

        // If no active users are found
        if (activeUsers.length === 0) {
            return res.status(404).json({ message: 'No active users found' ,users:{}});
        }

        // Return the active users
        return res.status(200).json({ users: activeUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving active users', error });
    }
};



export const getRequestUsers = async (req, res) => {
    try {
        // Find all users with active status set to true
        const requestUsers = await User.find({ request: true });

        // If no active users are found
        if (requestUsers.length === 0) {
            return res.status(404).json({ message: 'No active users found' });
        }

        // Return the active users
        return res.status(200).json({ users: requestUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving active users', });
    }
};



export const getOtherRequestUsers = async (req, res) => {
  try {
      // Find all users with active status set to true
      const requestUsers = await User.find({ OtherRequest: true });

      // If no active users are found
      if (requestUsers.length === 0) {
          return res.status(404).json({ message: 'No active users found' });
      }

      // Return the active users
      return res.status(200).json({ users: requestUsers });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error retrieving active users', });
  }
};

export const updateCount = async (req, res) => {
    const { userId } = req.params; // ID of the user being updated
    const { serviceCount, modifiedBy,count } = req.body; // Modified by and new service count
  
    try {
      // Check if the modifying user exists
      const modifyingUser = await User.findById(modifiedBy);
      if (!modifyingUser) {
        return res.status(404).json({ message: "Modifying user not found." });
      }
  
      // Update the user's service count and the accessedBy array
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          serviceCount, // Update serviceCo // Increment the count attribute
          $push: {
            accessedBy: { user: modifiedBy, count: count }, // Add the modifying user with count
          },
        },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json({ newuser:updatedUser });
    } catch (err) {
      res.status(500).json({ message: "Error updating service count",err });
    }
  };
  
  import nodemailer from 'nodemailer';
  export const approveRequest = async (req, res) => {
    try {
      const { userId } = req.params;
      const { requestId, requestedTo, identifier } = req.body;
  
      if (!requestId || !userId || !requestedTo || !identifier) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const targetRequest = user.orderRequest.find(
        (request) => request._id.toString() === requestId
      );
      if (!targetRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
  
      // Update the user service count
      user.serviceCount -= targetRequest.serviceCount || 1;
      if (user.serviceCount < 0) {
        return res.status(400).json({ message: "Insufficient offers remaining" });
      }
  
      if (user.serviceCount === 0) user.active = false;

      // console.log(targetRequest.phoneNumber)
  
      // Move to accessedBy
      user.accessedBy.push({
        user: targetRequest.requestedBy,
        count: targetRequest.serviceCount || 1,
        phoneNumber:targetRequest.phoneNumber
      });
  
      // Remove from orderRequest
      user.orderRequest = user.orderRequest.filter(
        (request) => request._id.toString() !== requestId
      );
  
      // Update the requested user's `requestedTo` array
      const requestedByUser = await User.findById(requestedTo);

      if (requestedByUser) {
       const requestToUpdate = requestedByUser.requestedTo.find((req) => {
  console.log("Checking request:", req);
  console.log(
    "Condition 1 (userDetails match):",
    req.userDetails.toString() === userId
  );
  console.log(
    "Condition 2 (createdAt match):",
  req.identifier===identifier
  );
  return (
    req.userDetails.toString() === userId &&
    req.identifier===identifier
  );
});

  
        if (requestToUpdate) {
          requestToUpdate.status = "approved";
          await requestedByUser.save();
        } else {
          console.warn(
            `No matching request found in requestedTo for userId: ${userId} and time: ${time}`
          );
        }
      }
  
      // Send email notification
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
  
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: requestedByUser?.email,
          subject: "Order Request Approved",
          text: `Hello ${requestedByUser?.name},\n\nYour order request has been approved. Please contact the user at their phone number: ${user.phoneNumber} for further details.\n\nBest regards,Campus Connect`,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email: ", error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      } catch (emailError) {
        console.error("Error during email sending:", emailError);
      }
  
      // Save the updated user
      await user.save();
  
      const updatedUser = await User.findById(userId)
        .populate("accessedBy.user")
        .populate("orderRequest.requestedBy");
  
      res.status(200).json({
        message: "Request approved and moved to accessedBy",
        newuser: updatedUser,
      });
    } catch (error) {
      console.error("Error in approveRequest:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };

  
  export const OtherApproveRequest = async (req, res) => {
    try {
      const { userId } = req.params;
      const { requestId, requestedTo, identifier } = req.body;
  
      if (!requestId || !userId || !requestedTo || !identifier) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const targetRequest = user.OtherOrderRequest.find(
        (request) => request._id.toString() === requestId
      );
      if (!targetRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
  
      // Update the user service count
      // user.serviceCount -= targetRequest.serviceCount || 1;
      // if (user.serviceCount < 0) {
      //   return res.status(400).json({ message: "Insufficient offers remaining" });
      // }
  
      // if (user.serviceCount === 0) user.active = false;
  
      // Move to accessedBy
      user.OtherAccessedBy.push({
        user: targetRequest.requestedBy,
        phoneNumber:targetRequest.phoneNumber
      });
  
      // Remove from orderRequest
      user.OtherOrderRequest = user.OtherOrderRequest.filter(
        (request) => request._id.toString() !== requestId
      );
  
      // Update the requested user's `requestedTo` array
      const requestedByUser = await User.findById(requestedTo);

      if (requestedByUser) {
       const requestToUpdate = requestedByUser.OtherRequestedTo.find((req) => {
  console.log("Checking request:", req);
  console.log(
    "Condition 1 (userDetails match):",
    req.userDetails.toString() === userId
  );
  console.log(
    "Condition 2 (createdAt match):",
  req.identifier===identifier
  );
  return (
    req.userDetails.toString() === userId &&
    req.identifier===identifier
  );
});

  
        if (requestToUpdate) {
          requestToUpdate.status = "approved";
          await requestedByUser.save();
        } else {
          console.warn(
            `No matching request found in requestedTo for userId: ${userId} and time: ${time}`
          );
        }
      }
  
      // Send email notification
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
  
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: requestedByUser?.email,
          subject: "Deliver Request Approved",
          text: `Hello ${requestedByUser?.name},\n\nYour Delivery request has been approved. Please contact the user at their phone number: ${user.phoneNumber} for further details.\n\nBest regards, Campus Connect`,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email: ", error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      } catch (emailError) {
        console.error("Error during email sending:", emailError);
      }
  
      // Save the updated user
      await user.save();
  
      const updatedUser = await User.findById(userId)
        .populate("OtherAccessedBy.user")
        .populate("OtherOrderRequest.requestedBy");
  
      res.status(200).json({
        message: "Request approved and moved to accessedBy",
        newuser: updatedUser,
      });
    } catch (error) {
      console.error("Error in approveRequest:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
    


   // Assuming you are using nodemailer for email sending
   export const OtherRejectRequest = async (req, res) => {
    try {
      console.log("entered in server")
      const { userId } = req.params;
      const { requestId, requestedTo, identifier } = req.body;

      // console.log(requestId,requestedTo,identifier,userId)
  
      if (!requestId || !userId || !requestedTo || !identifier) {
        
        return res.status(400).json({ message: "Missing required fields" });
      }
      // console.log(1)
  
      // Find the user who received the request
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // console.log(2)
  
      // Find the target request by requestId in the orderRequest array
      const targetRequest = user.OtherOrderRequest.find(
        (request) => request._id.toString() === requestId
      );

      // console.log(3)
      if (!targetRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      // console.log(4)
  
      // Remove the request from orderRequest
      user.OtherOrderRequest = user.OtherOrderRequest.filter(
        (request) => request._id.toString() !== requestId
      );
  
      // console.log(5)
      // Update the requested user's `requestedTo` array
      const requestedByUser = await User.findById(requestedTo);
      if (requestedByUser) {
        // console.log('requesteduser')
        const requestToUpdate = requestedByUser.OtherRequestedTo.find((req) => {
          return (
            req.userDetails.toString() === userId && req.identifier === identifier
          );
        });
  
        if (requestToUpdate) {
          // console.log('requesstedUpdate')

          requestToUpdate.status = "rejected"; // Update the status to rejected
          await requestedByUser.save();
        } else {
          console.warn(
            `No matching request found in requestedTo for userId: ${userId} and identifier: ${identifier}`
          );
        }

        // console.log('done');
  
        // Send email notification to the requested user
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
  
          const mailOptions = { 
            from: process.env.EMAIL_USER,
            to: requestedByUser.email,
            subject: "Delivery Service Request Rejected",
            text: `Hello ${requestedByUser.name},\n\nWe regret to inform you that your Delivery Service request has been rejected.\n\nBest regards, Campus Connect`,
          };
  
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        } catch (emailError) {
          console.error("Error during email sending:", emailError);
        }
      }
  
      // Save the updated user data
      await user.save();

      // console.log('done finally')
  
      // Retrieve the updated user details with populated fields
      const updatedUser = await User.findById(userId)
        .populate("OtherAccessedBy.user")
        .populate("OtherOrderRequest.requestedBy");
  
      res.status(200).json({
        message: "Request rejected and removed",
        newuser: updatedUser,
      });
    } catch (error) {
      console.error("Error in rejectRequest:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };  
  
  
  
   // Assuming you are using nodemailer for email sending
   export const rejectRequest = async (req, res) => {
    try {
      console.log("entered in server")
      const { userId } = req.params;
      const { requestId, requestedTo, identifier } = req.body;

      // console.log(requestId,requestedTo,identifier,userId)
  
      if (!requestId || !userId || !requestedTo || !identifier) {
        
        return res.status(400).json({ message: "Missing required fields" });
      }
      // console.log(1)
  
      // Find the user who received the request
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // console.log(2)
  
      // Find the target request by requestId in the orderRequest array
      const targetRequest = user.orderRequest.find(
        (request) => request._id.toString() === requestId
      );

      // console.log(3)
      if (!targetRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      // console.log(4)
  
      // Remove the request from orderRequest
      user.orderRequest = user.orderRequest.filter(
        (request) => request._id.toString() !== requestId
      );
  
      // console.log(5)
      // Update the requested user's `requestedTo` array
      const requestedByUser = await User.findById(requestedTo);
      if (requestedByUser) {
        // console.log('requesteduser')
        const requestToUpdate = requestedByUser.requestedTo.find((req) => {
          return (
            req.userDetails.toString() === userId && req.identifier === identifier
          );
        });
  
        if (requestToUpdate) {
          // console.log('requesstedUpdate')

          requestToUpdate.status = "rejected"; // Update the status to rejected
          await requestedByUser.save();
        } else {
          console.warn(
            `No matching request found in requestedTo for userId: ${userId} and identifier: ${identifier}`
          );
        }

        // console.log('done');
  
        // Send email notification to the requested user
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
  
          const mailOptions = { 
            from: process.env.EMAIL_USER,
            to: requestedByUser.email,
            subject: "Order Request Rejected",
            text: `Hello ${requestedByUser.name},\n\nWe regret to inform you that your order request has been rejected.\n\nBest regards, Campus Connect`,
          };
  
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        } catch (emailError) {
          console.error("Error during email sending:", emailError);
        }
      }
  
      // Save the updated user data
      await user.save();

      // console.log('done finally')
  
      // Retrieve the updated user details with populated fields
      const updatedUser = await User.findById(userId)
        .populate("accessedBy.user")
        .populate("orderRequest.requestedBy");
  
      res.status(200).json({
        message: "Request rejected and removed",
        newuser: updatedUser,
      });
    } catch (error) {
      console.error("Error in rejectRequest:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };  

  
   
  
  export const updateUserPassword = async (req, res) => {
    const { userId } = req.params; // Assuming the user ID is passed in the URL
    const { currentPassword, newPassword } = req.body; // Assuming passwords are sent in the request body
  
    try {
      // Find the user by ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if the current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  
  // Delete accessedBy entry
  export const removeAccessedBy = async (req, res) => {
    try {
      const { userId } = req.params;
      const { index,count } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (index < 0 || index >= user.accessedBy.length) {
        return res.status(400).json({ message: 'Invalid index' });
      }
  
      user.accessedBy.splice(index, 1);
      user.serviceCount=user.serviceCount+count;
      await user.save();
  
      // Retrieve the updated user details
      const updatedUser = await User.findById(userId).populate('accessedBy.user').populate('orderRequest.requestedBy');
  
      res.status(200).json({ message: 'AccessedBy entry removed', newuser: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };



  
  export const OtherRemoveAccessedBy = async (req, res) => {
    try {
      const { userId } = req.params;
      const { index} = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (index < 0 || index >= user.OtherAccessedBy.length) {
        return res.status(400).json({ message: 'Invalid index' });
      }
  
      user.OtherAccessedBy.splice(index, 1);
    
      await user.save();
  
      // Retrieve the updated user details
      const updatedUser = await User.findById(userId).populate('OtherAccessedBy.user').populate('OtherOrderRequest.requestedBy');
  
      res.status(200).json({ message: 'AccessedBy entry removed', newuser: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  export const resetParcels = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find the user who received the request
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Reset the accessedBy and orderRequest fields
      const resetRequests = user.orderRequest; // Keeping track of orderRequests to update requestedTo
  
      // Resetting orderRequest and accessedBy to their initial state
      user.accessedBy = [];
      user.orderRequest = [];
      user.serviceCount = 5; // Reset serviceCount as per the original setup
  
      // Update the `requestedTo` status for users who have made requests to this user
      for (const request of resetRequests) {
        const requestedByUser = await User.findById(request.requestedBy._id);
        if (requestedByUser) {
          // Find the requestTo entry in the requestedByUser's requestedTo array
          const requestToUpdate = requestedByUser.requestedTo.find(
            (req) => req.userDetails.toString() === userId
          );
          if (requestToUpdate) {
            // Reset the status of the user in requestedTo to null or reset it as needed
            requestToUpdate.status = "reset"; // You can set it to any value that suits your logic
          }
          requestedByUser.requestPending = false;
          await requestedByUser.save();
        }
      }
  
      await user.save();
  
      // Retrieve the updated user details with populated fields
      const updatedUser = await User.findById(userId)
        .populate("accessedBy.user")
        .populate("orderRequest.requestedBy");
  
      res.status(200).json({
        message: "All parcels reset successfully",
        newuser: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  export const getResquestTo = async (req, res) => {
    const { userId } = req.params; // Get UserId from query params
    if (!userId) return res.status(400).send({ error: 'UserId is required' });

    try {
        const user = await User.findById(userId).populate({
            path: 'requestedTo.UserDetails',
            select: 'name status', // Specify the fields you want from UserDetails
            strictPopulate: false,
        });

        if (!user) return res.status(404).send({ error: 'User not found' });

        res.send(user.requestedTo); // Send the requestedTo array with populated data
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};


export const deleteRequestFromRequestedTo = async (req, res) => {
  try {
      const { userId, index } = req.params;

      if (!userId || index === undefined) {
          return res.status(400).json({ message: 'Invalid parameters' });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (index < 0 || index >= user.requestedTo.length) {
          return res.status(400).json({ message: 'Invalid index' });
      }

      user.requestedTo.splice(index, 1);
      await user.save();

      res.status(200).json({ message: 'Request deleted successfully',cart:user.requestedTo.length });
  } catch (error) {
      console.error('Error deleting request:', error);
      res.status(500).json({ message: 'Server error' });
  }
};
  


export const deleteOtherRequestFromRequestedTo = async (req, res) => {
  try {
      const { userId, index } = req.params;

      if (!userId || index === undefined) {
          return res.status(400).json({ message: 'Invalid parameters' });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (index < 0 || index >= user.OtherRequestedTo.length) {
          return res.status(400).json({ message: 'Invalid index' });
      }

      user.OtherRequestedTo.splice(index, 1);
      await user.save();

      res.status(200).json({ message: 'Request deleted successfully',cart:user.OtherRequestedTo.length });
  } catch (error) {
      console.error('Error deleting request:', error);
      res.status(500).json({ message: 'Server error' });
  }
};
