import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../../db/client.js'
import validatePhone from '../../validators/phone.js'
import { hashPassword, comparePassword } from '../../utils/hash.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export const registerPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../../static/register.html'))
}

export const loginPage = async function (req, res) {
    res.sendFile(path.join(__dirname, '../../static/login.html'))
}

export const registerUser = async function (req, res) {
    const { phone, firstName, lastName, password } = req.body
    if (!validatePhone(String(phone))) {
        return res.status(400).send({message: 'Некорректный номер телефона. Пример: +79287365543.'})
    }

    try {
        const userCheck = await prisma.user.findUnique({
            where: {
                phone: phone,
            },
        })
        if (userCheck) {
            return res.status(400).send({message: 'Пользователь уже существует.'})
        }

        const hashedPswd = await hashPassword(password)
        if (!hashPassword) {
            return res.status(500).send({message: 'Не удалось захэшировать пароль.'})
        }

        await prisma.user.create({
            data: {
                phone: phone,
                password: hashedPswd,
                first_name: firstName,
                last_name: lastName,
            }
        })
        res.status(200).send({message: 'Вы успешно зарегистрировались.'})
    } catch (err) {
        console.error(err)
        res.status(500).send({message: 'Ошибка при регистрации.'})
    }
}

export const loginUser = async function (req, res) {
    const { phone, password } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: {
                phone: phone,
            },
        })

        if (!user || !(await comparePassword(password, user.password))) {
            res.status(400).send({message: 'Неверный номер телефона или пароль.'})
        } else {
            req.session.user = user
            res.status(200).send({
                message: 'Вы успешно авторизовались',
                object: user,
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({message: 'Ошибка при авторизации.'})
    }
}

export const logoutUser = async function (req, res) {
    if (!req.session.user) {
        return res.status(400).send({message: 'Пользователь не авторизован.'})
    }
    req.session.destroy()
    res.status(200).send({message: 'OK'})
}