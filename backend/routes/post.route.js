import express from "express";
import {createPost, commentOnPost,deletePost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router()

router.post("/all", protectRoute, getAllPosts)
router.post("/create", protectRoute, createPost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.post("/likes/:id", protectRoute, getLikedPosts)
router.post("/comment/:id", protectRoute, commentOnPost)
router.post("/:id", protectRoute, deletePost)
router.post("/following", protectRoute, getFollowingPosts)
router.post("/posts/:username", protectRoute, getUserPosts)

export default router;