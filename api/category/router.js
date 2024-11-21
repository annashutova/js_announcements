import express from 'express'
import { checkAuth, isAdminAuth } from '../../utils/auth.js'
import { getCategories } from './handlers.js'

const router = express.Router()


router.get('/categories', checkAuth, getCategories)

export default router