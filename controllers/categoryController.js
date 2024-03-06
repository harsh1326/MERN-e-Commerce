import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const createCategoryController = async(req,res)=>{
    try{
        const {name} = req.body
        if(!name){
            return res.status(401).send({message:"Name Is Required"});
        }
        const existingCategory = await categoryModel.findOne({name});
        if(existingCategory){
            return res.status(200).send({
                success:true,
                message:"Category Already Exists",
            })
        }

        const category  = await new categoryModel({name, slug:slugify(name)}).save()
        res.status(201).send({
            success:true,
            message: "New Category Created",
            category,
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Category",
        })
    }
}


export const updateCategoryController = async (req, res)=>{
    try{
        const {name} = req.body
        const {id} = req.params
        const category = await categoryModel.findByIdAndUpdate(id, {name, slug:slugify(name)}, {new:true})
        res.status(200).send({
            success:true,
            message: " Category Updated",
            category,
        })


    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Update Category",
        })
    }
}
 
export const categoryController = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.status(200).send({
            success: true,
            message: "All categories list",
            categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Error in fetching categories",
        });
    }
};


export const singleCategoryController = async(req,res)=>{
    try{
        const category = await categoryModel.findOne({slug:req.params.slug})
        res.status(200).send({
            success:true,
            message: " Single Category",
            category,
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in geting Single Category",
        })
    }
}

export const deleteCategoryController = async(req,res)=>{
    try{
        const {id} = req.params
        const category = await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success:true,
            message: "Delete Category Successfully",
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in Deleting Category",
        })
    }
}