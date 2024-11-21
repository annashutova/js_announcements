import prisma from '../db/client.js'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const editCategoryPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../static/admin/category-edit-page.html'))
}

export const createCategoryPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../static/admin/category-create-page.html'))
}

export const getCategoryById = async function (req, res) {
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
}

export const postCategory = async function (req, res) {
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
}

export const updateCategory = async function (req, res) {
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
}

export const deleteCategory = async function (req, res) {
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
}