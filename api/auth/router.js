import express from 'express'
import { registerPage, loginPage, registerUser, loginUser, logoutUser } from './handlers.js'

const router = express.Router()


router.get('/register', registerPage)
router.get('/login', loginPage)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)

export default router