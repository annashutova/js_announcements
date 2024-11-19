import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import prisma from '../db/client.js'
import { checkAuth, isAdminAuth } from './auth.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


router.get('/categories', checkAuth, async (req, res) => {
    try {
        const categories = await prisma.category.findMany()
        return res.json(categories)
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при получении категорий.')
    }
})

router.post('/categories', isAdminAuth, async (req, res) => {
    const { title } = req.body

    try {
        await prisma.category.create({
            data: {
                title: title,
            }
        })

        return res.status(201).send('Категория успешно создана.')
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при создании категории.')
    }
})

router.put('/categories/:id', isAdminAuth, async (req, res) => {
    const { title } = req.body
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }


    try {
        await prisma.category.update({
            where: {
                id: id,
            },
            data: {
                title: title,
            },
        })

        return res.status(200).send('Категория успешно обновлена.')
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при обновлении категории.')
    }
})

router.delete('/categories/:id', isAdminAuth, async (req, res) => {
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }

    try {
        const category = await prisma.category.findUnique({
            where: {
                id: id,
            },
        })

        if (!category) {
            return res.status(404).send(`Категории с id = ${id} не найдено.`)
        }

        const deletedCategory = await prisma.category.delete({
            where: { id: id },
        })
        if (deletedCategory) {
            return res.status(204).send(`Категория с id = ${id} успешно удалена.`)
        }

    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при удалении категории.')
    }
})

export default router