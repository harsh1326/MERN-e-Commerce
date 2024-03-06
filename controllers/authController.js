import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js"
import JWT from 'jsonwebtoken';

export const registerController = async (req,res)=>{

    try{
        const {name,email, password, phone, address,answer, role} = req.body;

        // Validations
        if(!name){
            return res.send({message:'name is required'});
        }
       
        if(!email){
            return res.send({message:'email is required'});
        }
       
        if(!password){
            return res.send({message:'Password is required'});
        }
        if(!phone){
            return res.send({message:'Phone is required'});
        }
        if(!address){
            return res.send({message:'Address is required'});
        }
        if(!answer){
            return res.send({message:'Answer is required'});
        }
        if(!role){
            return res.send({message:'Role is required'});
        }
        // Check user
        const existingUser = await userModel.findOne({email})
        // Existing User
        if(existingUser){
            return res.status(200).send({
                success:false,
                message: 'Already Register Please login',
            })
        }

        // Register User
        const hashedPassword = await hashPassword(password)
        // save
        const user = await new userModel({name, email, phone, address, password:hashedPassword, answer, role}).save();


        res.status(201).send({
            success:true,
            message: "User Register Successfully",
            user
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message: 'Error in Registeration',
            error
        })
    }

};


// POST || Login

export const loginController = async(req,res)=>{

    try{
        const {email, password} = req.body;

        // Validation
        if(!email || !password){
            return res.status(404).send({
                success: false,
                message: 'Invalid Email or Password'
            });

        }
        // Check User
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Email is Not Registerd'
            });
        }

        const match = await comparePassword(password, user.password);
        if(!match){
            return res.status(200).send({
                success:false,
                message:'Invalid Password',
            })
        }

        // TOKEN
        const token = await JWT.sign({_id:user._id}, process.env.JWT_SECRET,{
            expiresIn:"7d",
        });
        res.status(200).send({
            success:true,
            message:'Login Successfully',
            user:{
                _id:user._id,
                Name:user.name,
                Email:user.email,
                Phone:user.phone,
                address:user.address,
                role:user.role,
            },
            token,
        })
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message: 'Error in Login',
            error,
        })
    }

}


// Forgot Password Route

export const forgotPasswordController = async (req, res) => {
    try {
      const { email, answer, newPassword } = req.body;
      if (!email) {
        res.status(400).send({ message: "Emai is required" });
      }
      if (!answer) {
        res.status(400).send({ message: "answer is required" });
      }
      if (!newPassword) {
        res.status(400).send({ message: "New Password is required" });
      }
      //check
      const user = await userModel.findOne({ email, answer });
      //validation
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Wrong Email Or Answer",
        });
      }
      const hashed = await hashPassword(newPassword);
      await userModel.findByIdAndUpdate(user._id, { password: hashed });
      res.status(200).send({
        success: true,
        message: "Password Reset Successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Something went wrong",
        error,
      });
    }
  };



// Test Controller

export const testController = (req,res)=>{
    try{
        res.send("Protected Route");
    }catch(error){
        console.log(error)
        res.send({error});
    }
}


export const updateProfileController = async(req, res)=>{
    try{
            const {name,email, password, phone, address} = req.body;
            const user = await userModel.findById(req.user._id)


            if(password && password.length < 6){
                return res.json({error:'Password is required and 6 Charchter Long'})
            }
            const hashedPassword = password ? await hashPassword(password) : undefined
            const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
                name : name || user.name,
                email : email || user.email,
                password : hashedPassword || user.password,
                address : address || user.address,
                phone : phone || user.phone
            }, {new:true})

            res.status(200).send({
                success:true,
                message:"Profile Updated Successfully",
                updatedUser
            })
  
    }catch(error){
      console.log(error);
      res.status(400).send({
        success: false,
        message: "error while Updating Profile",
        error,
      });
  
    }
  }



  export const getOrdersController = async(req,res)=>{
    try{

        const orders = await orderModel.find({buyer:req.user._id}).populate("products", "-photo").populate("buyer","name")
        res.json(orders);


    }catch(error){
        console.log(error);
        res.status(400).send({
          success: false,
          message: "error while geting Orders",
          error,
        });
    }
  }
  export const getAllOrdersController = async (req, res) => {
    try {
      // Fetch all orders from the database and sort them by createdAt in descending order
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({ createdAt: -1 });
  
      // Send the orders as a JSON response
      res.json({
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
      });
    } catch (error) {
      // If an error occurs, log the error and send a 500 response with an error message
      console.error("Error while getting orders:", error);
      res.status(500).json({
        success: false,
        message: "Error while getting orders",
        error: error.message,
      });
    }
  };
  

  export const orderStatusController = async(req,res)=>{
    try{
      const {orderId} = req.params
      const {status} = req.body
      const orders = await orderModel.findByIdAndUpdate(orderId, {status}, {new:true})
      res.json(orders);
    }catch(error){
      console.log(error)
      res.status(500).json({
        success: false,
        message: "Error while Updating Order Status",
        error: error.message,
      });
    }
  }