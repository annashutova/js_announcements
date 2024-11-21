import express from 'express'
import { checkAuth } from '../../utils/auth.js'
import { getUserById } from './handlers.js'


const router = express.Router()

router.get('/users/:id', checkAuth, getUserById)

export default router