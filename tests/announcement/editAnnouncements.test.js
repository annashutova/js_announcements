import request from 'supertest'
import { expect } from 'chai'
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('PUT /announcments/:id API Endpoint', () => {
  let agent
  let user
  let category
  let announcment

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
    await prisma.user.create({
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
      },
    })

    announcment = await prisma.announcment.create({
      data: {
        id: 1,
        title: 'Test Announcment',
        description: 'Test Description',
        active: true,
        authorId: user.id,
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
    const response = await agent.put('/announcments/abc').send({
      title: 'Updated Title',
      description: 'Updated Description',
      active: false,
      categoryId: category.id,
    })
    expect(response.status).to.equal(400)
    expect(response.text).to.equal('id должно быть числом.')
  })

  it('should return 404 if category is not found', async () => {
    const response = await agent.put(`/announcments/${announcment.id}`).send({
      title: 'Updated Title',
      description: 'Updated Description',
      active: false,
      categoryId: 999,
    })
    expect(response.status).to.equal(404)
    expect(response.text).to.equal(`Категории с id = 999 не найдено.`)
  })

  it('should return 404 if announcment is not found', async () => {
    const response = await agent.put('/announcments/999').send({
      title: 'Updated Title',
      description: 'Updated Description',
      active: false,
      categoryId: category.id,
    })
    expect(response.status).to.equal(404)
    expect(response.text).to.equal('Объявление с id = 999 не найдено.')
  })

  it('should return 403 if user is not the author and not an admin', async () => {
    await agent.post('/logout')
    await agent
      .post('/login')
      .send({ phone: '+79287365544', password: 'securePassword123' })

    const response = await agent.put(`/announcments/${announcment.id}`).send({
      title: 'Updated Title',
      description: 'Updated Description',
      active: false,
      categoryId: category.id,
    })
    expect(response.status).to.equal(403)
    expect(response.text).to.equal('Вы не можете изменить данное объявление.')
  })

  it('should update announcment successfully', async () => {
    const response = await agent.put(`/announcments/${announcment.id}`).send({
      title: 'Updated Title',
      description: 'Updated Description',
      active: false,
      categoryId: category.id,
    })
    expect(response.status).to.equal(200)
    expect(response.body.message).to.equal('Вы успешно обновили объявление.')

    const updatedAnnouncment = await prisma.announcment.findUnique({
      where: { id: announcment.id },
    })
    expect(updatedAnnouncment.title).to.equal('Updated Title')
    expect(updatedAnnouncment.description).to.equal('Updated Description')
    expect(updatedAnnouncment.active).to.be.false
    expect(updatedAnnouncment.categoryId).to.equal(category.id)
  })
})
