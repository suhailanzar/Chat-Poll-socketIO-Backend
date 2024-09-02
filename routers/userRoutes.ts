import { Router } from "express";
import { getGroupMessagesUser, getGroupPolls, getMessagesUser, getUsers, userLogin, userSignup } from "../controllers/userController";

const router = Router();


router.post('/login',userLogin)
router.post('/signup',userSignup)
router.get('/getUsers',getUsers)
router.post('/getMessagesUser',getMessagesUser)
router.post('/getGroupMessagesUser',getGroupMessagesUser)
router.post('/getGroupPolls',getGroupPolls)

export default router; 