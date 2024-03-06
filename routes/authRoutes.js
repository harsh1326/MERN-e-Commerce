import express from "express";
import {registerController, loginController, testController, forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController} from '../controllers/authController.js'
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";



// router object
const router = express.Router();


// Routing
// REGISTER || POST

router.post('/register', registerController);

// LOgin || POST
router.post('/login', loginController);

// Forgot Password || POST
router.post('/forgotpassword',forgotPasswordController)

// Test routes
router.get('/test',requireSignIn,isAdmin, testController);


// Protected Route for user
router.get('/user-auth',requireSignIn, (req,res)=>{
    res.status(200).send({ok:true});
})

// Protected Route fro admin
router.get('/admin-auth',requireSignIn,isAdmin, (req,res)=>{
    res.status(200).send({ok:true});
})

// Update Profile
router.put("/profile", requireSignIn, updateProfileController )

// Orders
router.get('/orders', requireSignIn, getOrdersController )

// Orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);


// order status update
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController)




export default router