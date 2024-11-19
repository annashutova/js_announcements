import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../utils/hash.js'


const prisma = new PrismaClient()

async function main() {
  const pswdUser1 = await hashPassword('qwerty1')
  const pswdUser2 = await hashPassword('qwerty2')
  const pswdAdmin = await hashPassword('admin')

  const home_cat = await prisma.category.upsert({
    where: { title: 'Дом' },
    update: {},
    create: {
      title: 'Дом'
    },
  })

  const garden_cat = await prisma.category.upsert({
    where: { title: 'Огород' },
    update: {},
    create: {
      title: 'Огород'
    },
  })

  const pet_cat = await prisma.category.upsert({
    where: { title: 'Животные' },
    update: {},
    create: {
      title: 'Животные'
    },
  })


  const user1 = await prisma.user.upsert({
    where: { phone: '+79143958873' },
    update: {},
    create: {
      phone: '+79143958873',
      first_name: 'Евгений',
      last_name: 'Гришин',
      password: pswdUser1,
      role: 'USER',
      announcments: {
        create: [
          {
            title: 'Уборка дома',
            description: 'Срочно требуется домработница в частный дом!!',
            active: true,
            categoryId: home_cat.id,
          },
          {
            title: 'Продам щенков хаски',
            description: 'Продаю щенков сибирской хаски, 3 месяца отроду.',
            active: true,
            categoryId: pet_cat.id,
          },
          {
            title: 'Замена труб',
            description: 'Требуется специалист по зпмене вентиляционных труб.',
            active: true,
            categoryId: home_cat.id,
          }
        ]
      },
    },
  })

  const user2 = await prisma.user.upsert({
    where: { phone: '+79186479935' },
    update: {},
    create: {
      phone: '+79186479935',
      first_name: 'Мария',
      last_name: 'Сапожникова',
      password: pswdUser2,
      role: 'USER',
      announcments: {
        create: [
          {
            title: 'Семена льна',
            description: 'Срочно куплю семена льна, пару пакетиков',
            active: true,
            categoryId: garden_cat.id,
          },
          {
            title: 'Продам помидоры',
            description: 'Продаю помидоры сорта Черный принц. В наличии есть 5 кг',
            active: true,
            categoryId: garden_cat.id,
          },
          {
            title: 'Куплю лоток',
            description: 'Срочно куплю закрытый кошачий лоток, можно вместе с наполнителем.',
            active: true,
            categoryId: pet_cat.id,
          },
          {
            title: 'Куплю доски',
            description: 'Куплю дубовые доски 30х100, необработанные.',
            active: false,
            categoryId: home_cat.id,
          }
        ]
      },
    },
  })

  const admin = await prisma.user.upsert({
    where: { phone: '+79186049935' },
    update: {},
    create: {
      phone: '+79186049935',
      first_name: 'Алла',
      last_name: 'Кирова',
      password: pswdAdmin,
      role: 'ADMIN'
    },
  })

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })