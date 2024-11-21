import prisma from '../../db/client.js'


export const getCategories = async function (req, res) {
    try {
        const categories = await prisma.category.findMany()
        return res.json(categories)
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при получении категорий.')
    }
}