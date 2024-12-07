import User from "../models/user.model.js"

export const protectRoute = async(req, res, next)=>{
    try{
        const token = req.cookies.jwt
        if(!token){
            res.status(401).json({error:"Unauthorized: No token provided"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            res.status(401).json({error:"Unauthorized: Invalid Token"})
        }

        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
            res.status(401).json({error:"user not found"})
        }

        req.user = user
        next()
    }catch(error){
        console.error("error", error.message)
        res.status(500).json({message:"server error"})
    }
    
}