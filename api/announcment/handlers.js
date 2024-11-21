import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../../db/client.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export const indexPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../../static/announcments.html'))
}

export const userAnnouncmentPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../../static/user-announcments.html'))
}

export const createAnnouncmentPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../../static/create-announcement.html'))
}

export const editAnnouncmentPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../../static/edit-announcement.html'))
}

export const getAnnouncments = async function (req, res) {
    const category = req.query.category

    let query = {
        where: {
            OR: [
                {
                    active: true,
                },
                {
                    respondentId: req.session.user.id,
                }
            ],
            category: {
                title: category,
            },
        },
        include: {
            category: true,
        },
        orderBy: [
            { active:  'desc'},
            { created_at: 'desc' },
        ],
    }

    if (req.session.user.role === 'ADMIN') {
        query = {
            where: {
                category: {
                    title: category,
                },
            },
            include: {
                category: true,
            },
            orderBy: [
                { active:  'desc'},
                { created_at: 'desc' },
            ],
        }
    }

    try {

        const announcments = await prisma.announcment.findMany(query)

        res.json(announcments)
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при получении объявлений.')
    }
}

export const getAnnouncmentById = async function (req, res) {
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }

    try {
        const announcment = await prisma.announcment.findUnique({
            where: {
                id: id
            },
        })

        if (!announcment) {
            res.status(404).send('Объявление не найдено.')
        }

        if (req.session.user.id !== announcment.authorId && req.session.user.role !== "ADMIN") {
            return res.status(403).send('У вас нет доступа к данной странице.')
        }

        res.json(announcment)
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при получении объявления.')
    }
}

export const getAnnouncmentByUserId = async function (req, res) {
    const category = req.query.category
    let { userId } = req.params
    userId = Number(userId)

    if (isNaN(userId)) {
        return res.status(400).send('userId должно быть числом.')
    }

    try {
        if (req.session.user.id !== userId && req.session.user.role !== "ADMIN") {
            return res.status(403).send('У вас нет доступа к данной странице.')
        }

        const announcments = await prisma.announcment.findMany({
            where: {
                category: {
                    title: category,
                },
                authorId: userId,
            },
            include: {
                category: true,
                respondent: true,
            },
            orderBy: [
                { active:  'desc'},
                { created_at: 'desc' },
            ],
        })

        res.json(announcments)
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при получении объявлений.')
    }
}

export const postAnnouncment = async function (req, res) {
    const {title, description, categoryId} = req.body

    try {
        const announcment = await prisma.announcment.create({
            data: {
                title: title,
                description: description,
                author: {
                    connect: { id: req.session.user.id }
                },
                category: {
                    connect: { id: categoryId }
                }
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

export const respondToAnnouncment = async function (req, res) {
    let { id } = req.params
    const { active } = req.body
    id = Number(id)
    let respondentId
    let msg = ''

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }

    try {
        const announcment = await prisma.announcment.findUnique({
            where: {
                id: id,
            },
        })

        if (!announcment) {
            return res.status(404).send(`Объявление с id = ${id} не найдено.`)
        }

        if (announcment.authorId === req.session.user.id && req.session.user.role !== 'ADMIN') {
            return res.status(403).send('Данное объявление недоступно для отклика.')
        }

        if (announcment.active === false && req.session.user.id !== announcment.respondentId) {
            return res.status(403).send('Данное объявление недоступно для отклика.')
        }

        if (!announcment.respondentId) {
            if (active == false) {
                msg = 'Вы успешно откликнулись на объявление.'
                respondentId = req.session.user.id
            } else {
                return res.status(400).send('Невозможно изменить активность данного объявления.')
            }
        } else {
            if (active == false) {
                return res.status(400).send('Вы уже откликнулись на данное объявление.')
            } else {
                msg = 'Вы отменили отклик на объявление.'
                respondentId = null
            }
        }

        await prisma.announcment.update({
            where: {
                id: id,
            },
            data: {
                respondentId: respondentId,
                active: active,
            },
        })
        res.status(200).send(msg)

    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при отклике на объявление.')
    }
}

export const updateAnnouncment = async function (req, res) {
    const { title, description, active, categoryId } = req.body
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }

    try {
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            }
        })
        if (!category) {
            return res.status(404).send(`Категории с id = ${categoryId} не найдено.`)
        }

        const announcment = await prisma.announcment.findUnique({
            where: {
                id: id,
            },
        })

        if (!announcment) {
            return res.status(404).send(`Объявление с id = ${id} не найдено.`)
        }

        if (announcment.authorId !== req.session.user.id && req.session.user.role !== 'ADMIN') {
            return res.status(403).send('Вы не можете изменить данное объявление.')
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

export const deleteAnnouncment = async function (req, res) {
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('announcmentId должно быть числом.')
    }

    try {
        const announcment = await prisma.announcment.findUnique({
            where: {
                id: id,
            },
        })

        if (!announcment) {
            return res.status(404).send(`Объявление с id = ${id} не найдено.`)
        }

        if (announcment.authorId !== req.session.user.id && req.session.user.role !== 'ADMIN') {
            return res.status(403).send('Вы не можете удалить данное объявление.')
        }

        const deletedAnnouncment = await prisma.announcment.delete({
            where: { id: id },
        })
        if (deletedAnnouncment) {
            return res.status(204).send(`Объявление с id = ${id} успешно удалено.`)
        }

    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при удалении объявления.')
    }
}