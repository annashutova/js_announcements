import express from 'express'
import { isAdminAuth } from '../utils/auth.js'
import { getUserById } from '../api/user/handlers.js'
import { getCategories } from '../api/category/handlers.js'
import { getAnnouncments, deleteAnnouncment } from '../api/announcment/handlers.js'
import { getUsers, postUser, updateUser, indexPage, deleteUser } from './user.js'
import { postCategory, updateCategory, deleteCategory } from './category.js'
import { updateAnnouncment, postAnnouncment, editAnnouncmentPage, createAnnouncmentPage } from './announcments.js'

const router = express.Router()

router.use(isAdminAuth)

router.get('/', indexPage)

router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.post('/users', postUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

router.get('/categories', getCategories)
router.post('/categories', postCategory)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

router.get('/announcments', getAnnouncments)
router.delete('/announcments/:id', deleteAnnouncment)
router.put('/announcments/:id', updateAnnouncment)
router.post('/announcments', postAnnouncment)

router.get('/announcment-edit', editAnnouncmentPage)
router.get('/announcment-create', createAnnouncmentPage)

export default router