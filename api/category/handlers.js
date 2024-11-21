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

export const getCategoryById = async function (req, res) {
    let { id } = req.params
    id = Number(id)

    if (isNaN(id)) {
        return res.status(400).send('id должно быть числом.')
    }

    try {
        const category = await prisma.category.findUnique({
            where: {
                id: id
            },
        })

        if (!category) {
            res.status(404).send('Категория не найдена.')
        }

        return res.json(category)
    } catch (err) {
        console.error(err)
        res.status(500).send('Ошибка при получении категории.')
    }
}