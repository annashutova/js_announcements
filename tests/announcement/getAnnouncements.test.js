import request from 'supertest'
import { expect } from 'chai'
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('/announcments API Endpoint', () => {
  let agent
  let user1
  let user2

  beforeEach(async () => {
    agent = request.agent(app)

    const hashedPassword1 = await hashPassword('securePassword123')
    user1 = await prisma.user.create({
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
    user2 = await prisma.user.create({
        data: {
          id: 2,
          phone: '+79287365544',
          first_name: 'Jane',
          last_name: 'Doe',
          password: hashedPassword2,
          role: 'USER',
        },
    })

    const hashedPassword3 = await hashPassword('adminPassword123')
    await prisma.user.create({
      data: {
        id: 3,
        phone: '+79287365545',
        first_name: 'Admin',
        last_name: 'User',
        password: hashedPassword3,
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
            title: 'Active Announcment',
            description: 'This is active',
            active: true,
            authorId: user1.id,
            categoryId: category.id,
        },
        {
            id: 2,
            title: 'Inactive Announcment',
            description: 'This is inactive',
            active: false,
            authorId: user1.id,
            categoryId: category.id,
        },
        {
            id: 3,
            title: 'Active Announcment',
            description: 'This is active',
            active: false,
            authorId: user2.id,
            categoryId: category.id,
        },
      ],
    })
  })

  afterEach(async () => {
    await prisma.announcment.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should return 302 if user is not authenticated', async () => {
    const unauthenticatedAgent = request.agent(app)
    const response = await unauthenticatedAgent.get('/announcments')
    expect(response.status).to.equal(302)
  })

  it('should return 200 and announcments for authenticated user', async () => {
    const response = await agent.get('/announcments')
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array')
    expect(response.body.length).to.equal(1)
  })

  it('should return 200 and announcments filtered by category', async () => {
    const response = await agent.get('/announcments?category=Category 1')
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array')
    expect(response.body.length).to.equal(1)
    expect(response.body[0].category.title).to.equal('Category 1')
  })

  it('should return 200 and all announcments for admin', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365545',
        password: 'adminPassword123',
      })

    const response = await agent.get('/announcments')
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array')
    expect(response.body.length).to.equal(3)
  })
})
