import express from "express"
import { login } from "../controllers/auth.controller.js"
import { signup } from "../controllers/auth.controller.js"
import { logout } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/protectRoute.js"
import { getme } from "../controllers/auth.controller.js"
const router = express.Router()


router.get("/me", protectRoute, getme)
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

export default router