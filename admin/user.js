import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../db/client.js'
import validatePhone from '../validators/phone.js'
import { hashPassword } from '../utils/hash.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export const indexPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../static/admin/index.html'))
}

export const editUserPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../static/admin/user-edit-page.html'))
}

export const createUserPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../static/admin/user-create-page.html'))
}

export const getUsers = async function (req, res) {
    try{
        const users = await prisma.user.findMany()
        res.json(users)
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при получении пользователей.')
    }
}

export const postUser = async function (req, res) {
    const { firstName, lastName, phone, password, role } = req.body
    const hashedPswd = await hashPassword(password)
    if (!hashPassword) {
        return res.status(500).send('Не удалось захэшировать пароль.')
    }

    if (!validatePhone(String(phone))) {
        return res.status(400).send('Некорректный номер телефона. Пример: +79287365543.')
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                phone: phone,
            }
        })
        if (existingUser) {
            return res.status(400).send('Пользователь с данным номером телефона уже существует.')
        }

        const user = await prisma.user.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                password: hashedPswd,
                role: role,
            }
        })
        res.status(201).send({
            message: 'Пользователь успешно создан.',
            object: user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при создании пользователя.')
    }
}

export const updateUser = async function (req, res) {
    const { firstName, lastName, phone, password, role } = req.body
    let { id } = req.params
    id = Number(id)
    const hashedPswd = await hashPassword(password)

    if (!hashPassword) {
        return res.status(500).send('Не удалось захэшировать пароль.')
    }

    if (!validatePhone(String(phone))) {
        return res.status(400).send('Некорректный номер телефона. Пример: +79287365543.')
    }

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }
    try{
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        })

        if (!user) {
            return res.status(404).send(`Пользователь с id = ${id} не найден.`)
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                password: hashedPswd,
                role: role,
            }
        })

        res.status(200).send({
            message: 'Вы успешно обновили пользователя.', 
            object: updatedUser,
        })
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при обновлении пользователя.')
    }
}

export const deleteUser = async function (req, res) {
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        })

        if (!user) {
            return res.status(404).send(`Пользователь с id = ${id} не найден.`)
        }

        const deletedUser = await prisma.user.delete({
            where: { id: id },
        })
        if (deletedUser) {
            return res.status(204).send(`Пользователь с id = ${id} успешно удален.`)
        }

    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при удалении пользователя.')
    }
}