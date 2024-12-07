import User from "../models/user.model.js"
import Notification from "../models/notification.model.js";
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async(req, res)=>{
    const {username} = req.params;

    try {
        const user = await User.findOne({username}).select("-password")
        if(!user){
            return res.status(404).json({error:"user not found"})
        }

        res.status(200).json(user)
    } catch (error) {
        console.log("Error in userGetProfile", error.message)
        res.status(500).json({error: error.message})
    }
}    

export const followUnfollowUsers = async(req, res)=>{
    const {id} = req.params
    
    try {
        const currentUser = await User.findById(req.user._id)
        const userToModify = await User.findById(id)

    if(id == req.user._id.toString()){
        return res.status(400).json({error:"you can't follow or unfollow yourself"})
    }

    if(!userToModify || !currentUser){
        return res.status(404).json({error:"user not found"})
    }

    const isFollowing = currentUser.following.includes(id)
    
    if(isFollowing){
        await User.findByIdAndUpdate(id, {$pull:{followers: req.user._id}}),
        await User.findByIdAndUpdate(req.user._id, {$pull:{following: id}})
        res.status(200).json({message:"user unfollowed successfully"})
    }else{
        await User.findByIdAndUpdate(id, {$push:{followers: req.user._id}},
        await User.findByIdAndUpdate(req.user._id,{$push:{following: id}})
        )
    }

    const newNotification = new Notification({
        type:"follow",
        from: req.user._id,
        to: userToModify._id,
    })

    await newNotification.save()

    res.status(200).json({message:"user followed successfully"})
    } catch (error) {
        
        console.log("Error in followUnfollowController", error.message)
        res.status(500).json({error: error.message})
    }

}

export const suggestedUsers = async(req, res)=>{
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne:userId}
                },
                
            },
            {$sample:{size:10}}
        ])

        const filteredUsers = users.filter(user=>!usersFollowedByMe.following.includes(user._id))
        const suggestUsers = filteredUsers.slice(0, 4)
        
        suggestUsers.forEach(user=>user.password=null)

    } catch (error) {
        
    }
}

export const updateProfile = async(req, res)=>{
    const {username, currentPassword, newPassword, email, fullName, bio, link} = req.body;

    let {profileImg, coverImg} = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId) 

    if((!currentPassword && newPassword)||(!newPassword && currentPassword)){
        return res.status(400).json({error:"please provide both the current and new password"})
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if(!isMatch){
        return res.status(400).json({error:"current password is incorrect"})
    }

    if(newPassword.length < 6){
        return res.status(400).json({error:"Password length must be more than 6 characters"})
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(newPassword, salt)

    if(profileImg){
        if(user.profileImg){
            cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
        }
        const uploadedResponse = await cloudinary.uploader.upload(profileImg)
        profileImg = uploadedResponse.secure_url;
    }
    if(coverImg){
        if(user.coverImg){
            cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImg)
        coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName
    user.email = email || user.email
    user.username = username || user.username
    user.profileImg = profileImg || user.profileImg
    user.coverImg = coverImg || user.coverImg
    user.bio = bio || user.bio
    user.link = link || user.link

    user = await user.save()

    user.password = null

    return res.status(200).json(user);

    } catch (error) {
        console.log("Error in update profile controller", error.message)
        res.status(500).json({error: error.message})
    }

}