import request from 'supertest'
import { expect } from 'chai'
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('POST /announcments/:id API Endpoint', () => {
  let agent
  let user
  let otherUser
  let announcment
  let category

  beforeEach(async () => {
    agent = request.agent(app)

    const hashedPassword1 = await hashPassword('securePassword123')
    user = await prisma.user.create({
      data: {
        id: 1,
        phone: '+79287365543',
        first_name: 'John',
        last_name: 'Doe',
        password: hashedPassword1,
        role: 'USER',
      },
    })

    const hashedPassword2 = await hashPassword('securePassword123')
    otherUser = await prisma.user.create({
      data: {
        id: 2,
        phone: '+79287365544',
        first_name: 'Jane',
        last_name: 'Smith',
        password: hashedPassword2,
        role: 'USER',
      },
    })

    category = await prisma.category.create({
        data: {
            id: 1,
            title: 'Test Category',
        }
    })

    announcment = await prisma.announcment.create({
      data: {
        id: 1,
        title: 'Test Announcment',
        description: 'Test Description',
        active: true,
        authorId: otherUser.id,
        categoryId: category.id,
      },
    })

    await agent
      .post('/login')
      .send({ phone: '+79287365543', password: 'securePassword123' })
  })

  afterEach(async () => {
    await prisma.announcment.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should return 400 if id is not a number', async () => {
    const response = await agent.post('/announcments/abc').send({ active: false })
    expect(response.status).to.equal(400)
    expect(response.text).to.equal('id должно быть числом.')
  })

  it('should return 404 if announcment is not found', async () => {
    const response = await agent.post('/announcments/999').send({ active: false })
    expect(response.status).to.equal(404)
    expect(response.text).to.equal('Объявление с id = 999 не найдено.')
  })

  it('should return 403 if user tries to respond to their own announcment', async () => {
    const userAnnouncment = await prisma.announcment.create({
      data: {
        id: 2,
        title: 'User Announcment',
        description: 'Test Description',
        active: true,
        authorId: user.id,
        categoryId: category.id,
      },
    })

    const response = await agent.post(`/announcments/${userAnnouncment.id}`).send({ active: false })
    expect(response.status).to.equal(403)
    expect(response.text).to.equal('Данное объявление недоступно для отклика.')
  })

  it('should respond to announcment successfully', async () => {
    const response = await agent.post(`/announcments/${announcment.id}`).send({ active: false })
    expect(response.status).to.equal(200)
    expect(response.text).to.equal('Вы успешно откликнулись на объявление.')

    const updatedAnnouncment = await prisma.announcment.findUnique({
      where: { id: announcment.id },
    })
    expect(updatedAnnouncment.respondentId).to.equal(user.id)
    expect(updatedAnnouncment.active).to.be.false
  })

  it('should return 400 if user tries to respond again', async () => {
    await agent.post(`/announcments/${announcment.id}`).send({ active: false })

    const response = await agent.post(`/announcments/${announcment.id}`).send({ active: false })
    expect(response.status).to.equal(400)
    expect(response.text).to.equal('Вы уже откликнулись на данное объявление.')
  })

  it('should allow user to cancel their response', async () => {
    await agent.post(`/announcments/${announcment.id}`).send({ active: false })

    const response = await agent.post(`/announcments/${announcment.id}`).send({ active: true })
    expect(response.status).to.equal(200)
    expect(response.text).to.equal('Вы отменили отклик на объявление.')

    const updatedAnnouncment = await prisma.announcment.findUnique({
      where: { id: announcment.id },
    })
    expect(updatedAnnouncment.respondentId).to.be.null
    expect(updatedAnnouncment.active).to.be.true
  })
})
