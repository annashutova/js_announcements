import express from 'express'
import { checkAuth } from '../../utils/auth.js'
import {
    indexPage, userAnnouncmentPage, createAnnouncmentPage,
    editAnnouncmentPage, getAnnouncmentById, getAnnouncmentByUserId,
    getAnnouncments, postAnnouncment, respondToAnnouncment,
    updateAnnouncment,deleteAnnouncment
} from './handlers.js'

const router = express.Router()

router.get('/', checkAuth, indexPage)

router.get('/user-announcments', checkAuth, userAnnouncmentPage)
router.get('/create-announcement', checkAuth, createAnnouncmentPage)
router.get('/edit-announcment', checkAuth, editAnnouncmentPage)

router.get('/announcments', checkAuth, getAnnouncments)
router.get('/announcment_byId/:id', checkAuth, getAnnouncmentById)
router.get('/announcments/:userId', checkAuth, getAnnouncmentByUserId)
router.post('/announcments', checkAuth, postAnnouncment)
router.post('/announcments/:id', checkAuth, respondToAnnouncment)
router.put('/announcments/:id', checkAuth, updateAnnouncment)
router.delete('/announcments/:id', checkAuth, deleteAnnouncment)

export default router