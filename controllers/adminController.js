import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js'; 
import User from '../models/userModel.js' // Adjust the import path if needed

// Admin login controller

export const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = decoded;  // You can access the admin data from `req.admin`
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    // Compare provided password with the hashed password stored in the database
    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET,  // You should set this in your environment variables
      { expiresIn: '1h' }  // Token expiration time (1 hour in this case)
    );

    // Send the response with the token
    res.json({
      message: 'Login successful',
      token,
      adminId: admin._id,
      user:admin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const addAdmin=async(req,res,next)=>{
    const {name,email,password}=req.body;

    if(!email && !password && !name )
        {
            return res.status(500).json({message:"invalid inputs"})
        }
 
    
    
    

        let xadmin;
        try {
            xadmin= await Admin.findOne({email})
          
        } catch (error) {
            return next(error)
            
        }
      
        
    
        if(xadmin)
            {
               return  res.status(500).json({message:"admin already exits"})
            }
            
    let admin;
    const hashpassword=bcrypt.hashSync(password)

    try {
        admin= new Admin({name,email,password:hashpassword});
        admin=await admin.save()
        
    } catch (error) {

        return next(error)
        
    }

    if(!admin)
        {
            return res.status(500).json({message:"unable to store admin"});

        }
        return res.status(200).json({admin})
    
    }



    
export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  // console.log(id) // Extract the ID from request parameters

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};