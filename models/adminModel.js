import mongoose from "mongoose"

const Schema=mongoose.Schema;

const adminSchema=new Schema({

    name:{
        type:String,
        required:true,
    },
    resetPasswordToken: {
        type: String,
      },
      resetPasswordExpires: {
        type: Date,
      },
   
    email:{
        type:String,
        required:true,
        unique:true,

    },
    password:{
        type:String,
        required:true,
        unique:true,
        

    },
  
})

export default mongoose.model("Admin",adminSchema);