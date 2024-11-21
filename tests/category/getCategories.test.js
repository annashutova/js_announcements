import request from 'supertest'
import { expect } from 'chai'
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('/categories API Endpoint', () => {
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

    await agent
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'securePassword123',
      })

    await prisma.category.createMany({
      data: [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
        { id: 3, title: 'Category 3' },
      ],
    })
  })

  afterEach(async () => {
    await prisma.user.deleteMany()
    await prisma.category.deleteMany()
  })

  after(async () => {
    await prisma.user.deleteMany()
    await prisma.category.deleteMany()
    await prisma.$disconnect()
  })

  it('should return 302 if user is not authenticated', async () => {
    const unauthenticatedAgent = request.agent(app)
    const response = await unauthenticatedAgent.get('/categories')
    expect(response.status).to.equal(302)
  })

  it('should return 200 and a list of categories for authenticated user', async () => {
    const response = await agent.get('/categories')
    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array')
    expect(response.body.length).to.equal(3)
    expect(response.body[0].title).to.equal('Category 1')
  })
})
