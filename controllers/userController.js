import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


 // For verifying Google tokens


 export const getUser=async(req,res,next)=>{
    const userId=req.params.userId;

     
let newuser;


try {
 newuser= await User.findById(userId).populate('orderRequest.requestedBy', 'name email status requestPending request phoneNumber') // Populate requestedBy with specific fields
 .populate('accessedBy.user', 'name email phoneNumber')
 .populate('requestedTo.userDetails','name email count') // Populate the user field inside accessedBy
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
        const activeUsers = await User.find({}).populate('accessedBy.user', 'name email phoneNumber');

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

  export const approveRequest = async (req, res) => {
    try {
      const { userId } = req.params;
      const { requestId } = req.body;
  
      // Find the user who received the request
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Find the request to approve
      const requestIndex = user.orderRequest.findIndex((req) => req._id.toString() === requestId);
      if (requestIndex === -1) {
        return res.status(404).json({ message: "Request not found" });
      }
  
      const approvedRequest = user.orderRequest[requestIndex];
      user.serviceCount -= approvedRequest.serviceCount || 1;
      if (user.serviceCount == 0) {
        user.active = false;
        user.accessedBy.push({
          user: approvedRequest.requestedBy,
          count: approvedRequest.serviceCount || 1,
        });
        user.orderRequest.splice(requestIndex, 1);
  
        // Find the user who made the request
        const requestedByUser = await User.findById(approvedRequest.requestedBy._id);
        if (requestedByUser) {
          // Update the requestedTo attribute for the matching entry
          const requestToUpdate = requestedByUser.requestedTo.find(
            (req) => req.userDetails.toString() === userId
          );
          if (requestToUpdate) {
            requestToUpdate.status = "approved";
            // Remove the approved entry from requestedTo
            const requestToRemoveIndex = requestedByUser.requestedTo.findIndex(
              (req) => req.userDetails.toString() === userId
            );
            if (requestToRemoveIndex !== -1) {
              requestedByUser.requestedTo.splice(requestToRemoveIndex, 1); // Pop the index
            }
          }
    
          requestedByUser.requestPending = false;
          await requestedByUser.save();
    
          // Send email notification to the requested user
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER, // Your email address
              pass: process.env.EMAIL_PASS, // Your email password or app password
            },
          });
    
          const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: requestedByUser.email, // Receiver address
            subject: "Order Request Approved", // Subject line
            text: `Hello ${requestedByUser.name},\n\nYour order request has been confirmed. Please contact the user at their phone number: ${user.phoneNumber} for further details.\n\nBest regards, Your Team`, // Email body
          };
    
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
    
        await user.save();
    
        // Retrieve the updated user details with populated fields
        const updatedUser = await User.findById(userId)
          .populate("accessedBy.user")
          .populate("orderRequest.requestedBy");
    
        res.status(200).json({
          message: "Request approved and moved to accessedBy",
          newuser: updatedUser,
        });

      }
      else if(user.serviceCount<0)
      {
        res.status(404).json({
          message: "has only limited offers",});

      }
      else{
        user.accessedBy.push({
          user: approvedRequest.requestedBy,
          count: approvedRequest.serviceCount || 1,
        });
        user.orderRequest.splice(requestIndex, 1);
  
        // Find the user who made the request
        const requestedByUser = await User.findById(approvedRequest.requestedBy._id);
        if (requestedByUser) {
          // Update the requestedTo attribute for the matching entry
          const requestToUpdate = requestedByUser.requestedTo.find(
            (req) => req.userDetails.toString() === userId
          );
          if (requestToUpdate) {
            requestToUpdate.status = "approved";
            // Remove the approved entry from requestedTo
            const requestToRemoveIndex = requestedByUser.requestedTo.findIndex(
              (req) => req.userDetails.toString() === userId
            );
            if (requestToRemoveIndex !== -1) {
              requestedByUser.requestedTo.splice(requestToRemoveIndex, 1); // Pop the index
            }
          }
    
          requestedByUser.requestPending = false;
          await requestedByUser.save();
    
          // Send email notification to the requested user
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER, // Your email address
              pass: process.env.EMAIL_PASS, // Your email password or app password
            },
          });
    
          const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: requestedByUser.email, // Receiver address
            subject: "Order Request Approved", // Subject line
            text: `Hello ${requestedByUser.name},\n\nYour order request has been confirmed. Please contact the user at their phone number: ${user.phoneNumber} for further details.\n\nBest regards, Your Team`, // Email body
          };
    
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
    
        await user.save();
    
        // Retrieve the updated user details with populated fields
        const updatedUser = await User.findById(userId)
          .populate("accessedBy.user")
          .populate("orderRequest.requestedBy");
    
        res.status(200).json({
          message: "Request approved and moved to accessedBy",
          newuser: updatedUser,
        });

      }
  
      // Move the approved request to accessedBy
     
  
      // Update the user's serviceCount and active status
      
  
      // Remove the request from orderRequest
     
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  import nodemailer from "nodemailer"; // Assuming you are using nodemailer for email sending

  export const rejectRequest = async (req, res) => {
    try {
      const { userId } = req.params;
      const { index } = req.body;
  
      // Find the user who received the request
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Validate the index
      if (index < 0 || index >= user.orderRequest.length) {
        return res.status(400).json({ message: "Invalid index" });
      }
  
      const rejectedRequest = user.orderRequest[index];
  
      // Find the user who made the request
      const requestedByUser = await User.findById(rejectedRequest.requestedBy._id);
      if (requestedByUser) {
        // Update the requestedTo attribute for the matching entry
        const requestToUpdate = requestedByUser.requestedTo.find(
          (req) => req.userDetails.toString() === userId
        );
        if (requestToUpdate) {
          requestToUpdate.status = "rejected";
          // Remove the rejected entry from requestedTo
          const requestToRemoveIndex = requestedByUser.requestedTo.findIndex(
            (req) => req.userDetails.toString() === userId
          );
          if (requestToRemoveIndex !== -1) {
            requestedByUser.requestedTo.splice(requestToRemoveIndex, 1); // Pop the index
          }
        }
  
        requestedByUser.requestPending = false;
        await requestedByUser.save();
  
        // Send email notification to the requested user
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password or app password
          },
        });
  
        const mailOptions = {
          from: process.env.EMAIL_USER, // Sender address
          to: requestedByUser.email, // Receiver address
          subject: "Order Request Rejected", // Subject line
          text: `Hello ${requestedByUser.name},\n\nWe regret to inform you that your order request has been rejected. .\n\nBest regards, Your Team`, // Email body
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email: ", error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
  
      // Remove the request from orderRequest
      user.orderRequest.splice(index, 1);
      await user.save();
  
      // Retrieve the updated user details with populated fields
      const updatedUser = await User.findById(userId)
        .populate("accessedBy.user")
        .populate("orderRequest.requestedBy");
  
      res.status(200).json({
        message: "Request rejected and removed",
        newuser: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
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
  