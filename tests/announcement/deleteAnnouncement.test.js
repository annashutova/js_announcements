import request from 'supertest'
import { expect } from 'chai'
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('DELETE /announcments/:id API Endpoint', () => {
  let agent
  let user
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

    const hashedPassword2 = await hashPassword('adminPassword123')
    await prisma.user.create({
      data: {
        id: 2,
        phone: '+79287365544',
        first_name: 'Admin',
        last_name: 'User',
        password: hashedPassword2,
        role: 'ADMIN',
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
    const response = await agent.delete('/announcments/abc')
    expect(response.status).to.equal(400)
    expect(response.text).to.equal('announcmentId должно быть числом.')
  })

  it('should return 404 if announcment is not found', async () => {
    const response = await agent.delete('/announcments/999')
    expect(response.status).to.equal(404)
    expect(response.text).to.equal('Объявление с id = 999 не найдено.')
  })

  it('should return 403 if user is not the author or admin', async () => {
    await agent.post('/logout')
    const hashedPassword3 = await hashPassword('securePassword123')
    await prisma.user.create({
      data: {
        id: 3,
        phone: '+79287365545',
        first_name: 'Jane',
        last_name: 'Smith',
        password: hashedPassword3,
        role: 'USER',
      },
    })
    await agent
      .post('/login')
      .send({ phone: '+79287365545', password: 'securePassword123' })

    const response = await agent.delete(`/announcments/${announcment.id}`)
    expect(response.status).to.equal(403)
    expect(response.text).to.equal('Вы не можете удалить данное объявление.')
  })

  it('should delete announcment successfully if user is the author', async () => {
    const response = await agent.delete(`/announcments/${announcment.id}`)
    expect(response.status).to.equal(204)

    const deletedAnnouncment = await prisma.announcment.findUnique({
      where: { id: announcment.id },
    })
    expect(deletedAnnouncment).to.be.null
  })

  it('should delete announcment successfully if user is an admin', async () => {
    await agent.post('/logout')
    await agent
      .post('/login')
      .send({ phone: '+79287365544', password: 'adminPassword123' })

    const response = await agent.delete(`/announcments/${announcment.id}`)
    expect(response.status).to.equal(204)

    const deletedAnnouncment = await prisma.announcment.findUnique({
      where: { id: announcment.id },
    })
    expect(deletedAnnouncment).to.be.null
  })
})
