import request from 'supertest'
import { expect } from 'chai'
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('/announcment_byId/:id API Endpoint', () => {
  let agent
  let user
  let admin
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


    const hashedPassword2 = await hashPassword('adminPassword123')
    admin = await prisma.user.create({
      data: {
        id: 2,
        phone: '+79287365544',
        first_name: 'Admin',
        last_name: 'User',
        password: hashedPassword2,
        role: 'ADMIN',
      },
    })

    await agent
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'securePassword123',
      })

    const category = await prisma.category.create({
      data: {
        id: 1,
        title: 'Category 1',
      },
    })

    announcment = await prisma.announcment.create({
        data:
          {
              id: 1,
              title: 'Test Announcment',
              description: 'This is a test announcment',
              active: true,
              authorId: user.id,
              categoryId: category.id,
          },
      })
  })

  afterEach(async () => {
    await prisma.announcment.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should return 401 if user is not authenticated', async () => {
    const unauthenticatedAgent = request(app)
    const response = await unauthenticatedAgent.get(`/announcment_byId/${announcment.id}`)
    expect(response.status).to.equal(302)
  })

  it('should return 400 if id is not a number', async () => {
    const response = await agent.get('/announcment_byId/not-a-number')
    expect(response.status).to.equal(400)
    expect(response.text).to.equal('id должно быть числом.')
  })

  it('should return 404 if announcment does not exist', async () => {
    const response = await agent.get('/announcment_byId/999999')
    expect(response.status).to.equal(404)
    expect(response.text).to.equal('Объявление не найдено.')
  })

  it('should return 403 if user does not have access to the announcment', async () => {
    const hashedPassword3 = await hashPassword('adminPassword123')
    const otherUser = await prisma.user.create({
      data: {
        id: 3,
        phone: '+79287365545',
        first_name: 'Jane',
        last_name: 'Doe',
        password: hashedPassword3,
        role: 'USER',
      },
    })

    const otherAnnouncment = await prisma.announcment.create({
      data: {
        id: 2,
        title: 'Other Announcment',
        description: 'This belongs to someone else',
        active: true,
        authorId: otherUser.id,
        categoryId: announcment.categoryId,
      },
    })

    const response = await agent.get(`/announcment_byId/${otherAnnouncment.id}`)
    expect(response.status).to.equal(403)
    expect(response.text).to.equal('У вас нет доступа к данной странице.')
  })

  it('should return 200 and the announcment if user owns it', async () => {
    const response = await agent.get(`/announcment_byId/${announcment.id}`)
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('object')
    expect(response.body.title).to.equal('Test Announcment')
  })

  it('should return 200 and the announcment for admin', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365544',
        password: 'adminPassword123',
      })

    const response = await agent.get(`/announcment_byId/${announcment.id}`)
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('object')
    expect(response.body.title).to.equal('Test Announcment')
  })
})
