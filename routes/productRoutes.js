import express from "express"
import {isAdmin, requireSignIn} from "./../middlewares/authMiddleware.js"
import { GetReviewController, brainTreePaymentController, brainTreeTokenController, createProductController, deleteproductController, getProductController, getSingleProductController, productCategoryController, productCountController, productFilterController, productListController, productPhotoController, realtedProductController, reviewController, searchController, updateProductController } from "../controllers/productController.js";

import formidable from 'express-formidable'
const router = express.Router();

// Routes

// Create - product Route
router.post("/create-product", requireSignIn, isAdmin, formidable(),createProductController)

// update-product route
router.put("/update-product/:pid", requireSignIn, isAdmin, formidable(),updateProductController)

// get -product route
router.get('/get-product', getProductController)

// get -single - product
router.get('/single-product/:slug', getSingleProductController)

// get-photo
router.get("/product-photo/:pid", productPhotoController)

// Delete-product route
router.delete('/delete-product/:pid',requireSignIn, isAdmin, deleteproductController )

// Filter Product
router.post('/product-filter', productFilterController)

// Product Count
router.get('/product-count', productCountController);


// Product per Page
router.get("/product-list/:page" , productListController)

// search Product
router.get("/search/:keyword", searchController);


router.post('/review' , requireSignIn, reviewController)

router.get('/show-review/:productId' , GetReviewController)


//similar product
router.get("/related-product/:pid/:cid", realtedProductController);

// Category wise Product
router.get("/product-category/:slug", productCategoryController )

// Payment Token
router.get('/braintree/token', brainTreeTokenController)

// payments
router.post('/braintree/payment', requireSignIn, brainTreePaymentController)





export default router
