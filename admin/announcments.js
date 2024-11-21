import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../db/client.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const editAnnouncmentPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../static/admin/announcment-edit-page.html'))
}

export const createAnnouncmentPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../static/admin/announcment-create-page.html'))
}

export const postAnnouncment = async function (req, res) {
    const {title, description, categoryId, authorId, respondentId, active} = req.body

    if (authorId == respondentId) {
        return res.status(400).send('Автор не может откликнуться на свое объявление.')
    }

    try {
        const announcment = await prisma.announcment.create({
            data: {
                title: title,
                description: description,
                active: active,
                authorId: authorId,
                categoryId: categoryId,
                respondentId: respondentId,
            }
        })
        return res.status(201).send({
            message: 'Объявление успешно создано.',
            object: announcment,
        })

    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при создании объявления.')
    }
}

export const updateAnnouncment = async function (req, res) {
    const { title, description, active, categoryId, authorId, respondentId } = req.body
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }

    if (authorId == respondentId) {
        return res.status(400).send('Автор не может откликнуться на свое объявление.')
    }

    try {
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            }
        })
        if (!category) {
            return res.status(404).send(`Категории с id = ${id} не найдено.`)
        }

        const announcment = await prisma.announcment.findUnique({
            where: {
                id: id,
            },
        })

        if (!announcment) {
            return res.status(404).send(`Объявление с id = ${id} не найдено.`)
        }

        const updatedAnnouncment = await prisma.announcment.update({
            where: {
                id: id,
            },
            data: {
                title: title,
                description: description,
                active: active,
                categoryId: categoryId,
                authorId: authorId,
                respondentId: respondentId,
            },
        })
        res.status(200).send({
            message:'Вы успешно обновили объявление.',
            object: updatedAnnouncment
        })

    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при обновлении объявления.')
    }
}
