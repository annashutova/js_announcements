import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import prisma from '../db/client.js'
import validatePhone from '../validators/phone.js'
import { hashPassword, comparePassword } from '../utils/hash.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}


export function isAdminAuth(req, res, next) {
    if (req.session.user) {
        if (req.session.user.role !== 'ADMIN') {
            res.status(403).send({message: 'У вас нет доступа к этой странице.'})
        } else {
            next()
        }
    } else {
        res.redirect('/login');
    }
}

// export function isAdminOrOwner(req, res, next) {
//     if (req.session.user) {
//         const { user_id } = req.params

//         if (req.session.user.id === user_id || req.session.user.role == "ADMIN") {
//             next()
//         } else {
//             res.status(403).send('У вас нет доступа к этой странице.')
//         }
//     } else {
//         res.redirect('/login')
//     }
// }


router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/register.html'))
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/login.html'))
})

router.post('/register', async (req, res) => {
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
})


router.post('/login', async (req, res) => {
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
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.status(200).send({message: 'OK'})
})

export default router