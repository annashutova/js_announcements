import prisma from '../../db/client.js'


export const getUserById = async function (req, res) {
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }

    if (id !== req.session.user.id && req.session.user.role !== 'ADMIN') {
        return res.status(403).send('У вас нет доступа к данной странице.')
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

        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при получении пользователя.')
    }
}