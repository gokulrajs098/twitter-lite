import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async(res, req)=>{
    try {
        const {text} = req.body;
        let {img} = req.body

        const userId = req.user._id.toString()

        const user = await User.findById(userId)

        if(!user){
            return res.status(404).json({error:"user not found"})
        }

        if(!text && !img){
            return res.status(400).json({error:"Post must have a text or image"})

        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            user:userId,
            text,
            img
        })

        await newPost.save();
        res.status(201).json(newPost)



    } catch (error) {
        console.log("Error in create post controller", error.message)
        res.status(500).json({error: error.message})
    }
}

export const deletePost = async(req, res)=>{
try {
    const userId = req.user._id;
    const id = req.params
    const post = await Post.findById(id)

    if(!post){
        return res.status(404).json({error:"post not found"})
    }
    if(post.user.toString() !== userId.toString()){
        return res.status(401).json({error:"you are not authorized to delete the post"})
    }

    if(post.img){
        const imgId = post.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId)
    }

    await Post.findByIdAndDelete(id)

    res.status(200).json({message:"post successfully deleted"})
} catch (error) {
    console.log("Error in deletePost controller", error);
    res.status(500).json({error:"Internal server error"})
}

}

export const commentOnPost = async(req, res)=>{
    try {
        const {text} = req.body;
    const postId = req.paramas.id;
    const userId = req.user._id;

    if(!text){
        return res.status(400).json({error:"text field is required"});
    }
    const post = await Post.findById(postId)

    if(!post){
        return res.status(404).json({error:"post not found"})
    }

    const comment = {user:userId, text}

    post.comments.push(comment);
    await post.save();

    res.status(200).json(post)
    } catch (error) {
        console.log("Error in commentOnPost controller", error.message)
        res.status(500).json({error: error.message})
    }
}

export const likeUnlikePost = async(req,res)=>{
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const post = await Post.findById(id)

        if(!post){
            return res.status(404).json({error:"post not found"})
        }

        const isLiked = post.likes(id)

        if(isLiked){
            await Post.updateOne({_id:id},{$pull:{likes:userId}})
            await User.updateOne({_id:userId}, {$pull:{likedPosts:id}})

            const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString())
            res.status(200).json(updatedLikes) 
        }
        else{
            await Post.likes.push(userId)
            await User.updateOne({_id:userId}, {$push:{likedPosts:id}})
            

            const notification = new Notification({
                from:userId,
                to:id,
                type:"like"
            })
            await notification.save();

            const updatedLikes = post.likes
            res.status(200).json(updatedLikes)
        }

    } catch (error) {
        console.log("Error in likeUnlikeController", error.message)
        res.status(500).json({error: error.message})
    }
}

export const getAllPosts = async(req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path:"user",
            select:"-password"
        });

        if(posts.length == 0){
            return res.status(200).json([])
        }
        res.status(200).json(posts)
    } catch (error) {
        console.log("Error in getAllPosts controller", error.message)
        res.status(500).json({error: error.message})
    }
}

export const getLikedPosts = async(req, res)=>{
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"user not found"})
        }
        const likedPosts = await Post.find({_id:{$in: user.likedPosts}})
        .populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })
        res.status(200).json(likedPosts)
    } catch (error) {
        console.log("Error in likedPosts controller", error.message)
        res.status(500).json({error: error.message})
    }
}

export const getFollowingPosts = async(req, res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        const following = user.following

        const feedPosts = await Post.find({user:{$in: following}}) 
        .sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"user",
            select:"-password"
        })
        res.status(200).json(feedPosts)
    } catch (error) {
        console.log("Error in getFollowing Posts Controller", error.message)
        res.status(500).json({error: error.message})
    }
}

export const getUserPosts = async(req, res)=>{
    try {
        const {username} = req.params;
        const user = await User.findOne({username});

        if(!user){
            return res.status(404).json({error:"user not found"})
        }
        const posts = await Post.find({user:user._id})
        .sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        })

        res.status(200).json(posts)
    } catch (error) {
        console.log("Error in getUserPosts controller", error.message)
        res.status(500).json({error: error.message})
    }
}