import request from 'supertest'
import { expect } from 'chai'
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('/announcments/:userId API Endpoint', () => {
  let agent
  let user

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

    await prisma.announcment.createMany({
        data: [
        {
            id: 1,
            title: 'Announcment 1',
            description: 'Description 1',
            active: true,
            authorId: user.id,
            categoryId: category.id,
        },
        {
            id: 2,
            title: 'Announcment 2',
            description: 'Description 2',
            active: false,
            authorId: user.id,
            categoryId: category.id,
        },
        ]
    })
    })

  afterEach(async () => {
    await prisma.announcment.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should return 401 if user is not authenticated', async () => {
    const unauthenticatedAgent = request(app)
    const response = await unauthenticatedAgent.get(`/announcments/${user.id}`)
    expect(response.status).to.equal(302)
  })

  it('should return 400 if userId is not a number', async () => {
    const response = await agent.get('/announcments/not-a-number')
    expect(response.status).to.equal(400)
    expect(response.text).to.equal('userId должно быть числом.')
  })

  it('should return 403 if user tries to access announcments of another user', async () => {
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

    const response = await agent.get(`/announcments/${otherUser.id}`)
    expect(response.status).to.equal(403)
    expect(response.text).to.equal('У вас нет доступа к данной странице.')
  })

  it('should return 200 and the user\'s announcments', async () => {
    const response = await agent.get(`/announcments/${user.id}`)
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array').that.has.length(2)
    expect(response.body[0].title).to.equal('Announcment 1')
    expect(response.body[1].title).to.equal('Announcment 2')
  })

  it('should return 200 and announcments for admin', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365544',
        password: 'adminPassword123',
      })

    const response = await agent.get(`/announcments/${user.id}`)
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array').that.has.length(2)
    expect(response.body[0].title).to.equal('Announcment 1')
    expect(response.body[1].title).to.equal('Announcment 2')
  })
})
