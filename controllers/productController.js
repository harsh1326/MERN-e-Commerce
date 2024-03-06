import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js"
import Review from "../models/reviewModel.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";

import dotenv from "dotenv";

dotenv.config();



// Paymet gateway

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try { 
    // Assuming you have middleware configured to handle file uploads
    const { name, description, price, category, quantity, shipping } = req.fields;
    const photo = req.files.photo;

    // Validations
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).send({ error: "All fields are required." });
    }

    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo size should be less than 1MB." });
    }

    const slug = slugify(name);

    const product = new productModel({ name, slug, description, price, category, quantity, shipping });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: "Error in creating product.",
      message: error.message,
    });
  }
};


export const getProductController = async(req,res)=>{
    try{

        const products = await productModel.find({}).populate("category").select("-photo").limit(12).sort({createdAt:-1})
        res.status(200).send({
            success:true,
            countTotal: products.length,
            message:"All Products",
            products,
        })

    }catch(error){
        console.error(error);
        res.status(500).send({
          success: false,
          error: "Error in getting product.",
          message: error.message,
        });
    }
}

export const getSingleProductController = async(req,res) =>{
    try{
        const product = await productModel.findOne({slug:req.params.slug}).select("-photo").populate("category");
        res.status(200).send({
            success:true,
            message:"Single Product fetched",
            product,
        })

    }catch(error){
        console.error(error);
        res.status(500).send({
          success: false,
          error: "Error to get product.",
          message: error.message,
        });
    }
}

export const productPhotoController = async(req,res)=>{
  try{
    const product = await productModel.findById(req.params.pid).select("photo").populate("category");
    if(product.photo.data){
      res.set('Content-type', product.photo.contentType)
      return res.status(200).send(product.photo.data)
    }

  }catch(error){
    console.error(error);
        res.status(500).send({
          success: false,
          error: "Error While geting photo",
          message: error.message,
        });
  }
}


export const deleteproductController = async(req,res)=>{
  try{
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success:true,
      message:" Product Deleted", 
  })


  }catch(error){
    console.error(error);
    res.status(500).send({
      success: false,
      error: "Error in deleting Product",
      message: error.message,
    });
  }
}

export const updateProductController = async (req,res)=>{
  try{
    const { name, description, price, category, quantity, shipping } = req.fields;
    const photo = req.files.photo;

    // Validations
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).send({ error: "All fields are required." });
    }

    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo size should be less than 1MB." });
    }

    const slug = slugify(name);

    const product = await productModel.findByIdAndUpdate(req.params.pid,
      {...req.fields, slug:slugify(name)}, {new:true}); 

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product updated successfully.",
      product,
    });
    

  }catch(error){
    console.error(error);
    res.status(500).send({
      success: false,
      error: " Error in update Product",
      message: error.message,
    });
  }
}


export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};

    // Check if any categories are selected
    if (checked && checked.length > 0) {
      args.category = { $in: checked };
    }

    // Check if price range is selected
    if (radio && radio.length === 2) {
      args.price = { $gte: radio[0], $lte: radio[1] };
    }

    // Execute the query to find products based on the filter criteria
    const products = await productModel.find(args);

    // Send the response with the filtered products
    res.status(200).json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error("Error in filtering products:", error);
    res.status(500).json({
      success: false,
      error: "Error in filtering products",
      message: error.message,
    });
  }
};


export const productCountController = async(req,res)=>{
  try{

    const total = await productModel.find({}).estimatedDocumentCount()
    res.status(200).send({
      success:true,
      total,
    })


  }catch(error){
    console.log(error)
    res.status(500).send({
      success: false,
      error: " Error in Product Count",
      message: error.message,
    });
  }
}

export const productListController = async(req,res)=>{
  try{
    const perPage = 6
    const page = req.params.page ? req.params.page :1
    const products = await productModel.find({}).select("-photo").skip((page-1) * perPage).limit(perPage).sort({createdAt:-1})
    res.status(200).send({
      success: true,
      products,
    });
    

  }catch(error){
    console.log(error)
    res.status(500).send({
      success: false,
      error: " Error in Per page Ctrl",
      message: error.message,
    });
  }
}

export const searchController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } }, // Changed $option to $options
        { description: { $regex: keyword, $options: "i" } }, // Changed $option to $options
      ]
    }).select("-photo");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: "Error in Search Product",
      message: error.message,
    });
  }
};



// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};



export const productCategoryController = async(req,res)=>{
  try{
    const category = await categoryModel.findOne({slug:req.params.slug})
    const products = await productModel.find({category}).populate('category')
    res.status(200).send({
      success:true,
      category,
      products,
    })
  }catch(error){
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting product",
      error,
    });

  }

}


// PAYMENT GATEWAY API

export const brainTreeTokenController = async(req,res)=>{
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

// payment
export const brainTreePaymentController = async (req, res)=>{
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }

}



export const reviewController = async (req, res) => {
  try {
    const { productId, rating, review } = req.body;
    const newReview = new Review({ productId, rating, review }); // Use the Review model
    await newReview.save();
    res.status(201).json({ success: true, message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const GetReviewController = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId });

    // Return the list of reviews as a response
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


