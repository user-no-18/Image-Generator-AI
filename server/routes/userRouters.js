import express from 'express'
import {registerUser , loginUser, userCredits} from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/credits',userCredits)
export default userRouter

// ./ changed in post