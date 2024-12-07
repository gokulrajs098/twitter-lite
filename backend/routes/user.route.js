import e from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getUserProfile, suggestedUsers, updateProfile, followUnfollowUsers } from "../controllers/user.controller.js";


const router = e.Router()

router.get("/profile/:username",protectRoute, getUserProfile)
router.get("/suggested",protectRoute, suggestedUsers)
router.get("/update",protectRoute, updateProfile)
router.get("/follow/:id",protectRoute, followUnfollowUsers)

export default router