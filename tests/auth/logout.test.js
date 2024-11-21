import request from 'supertest'
import app from '../../app.js'
import prisma from '../db_client.js'
import { expect } from 'chai'
import { hashPassword } from '../../utils/hash.js'

describe('/logout API Endpoint', () => {
  let agent
  let testUser

  before(async () => {
    const hashedPassword = await hashPassword('securePassword123')
    testUser = await prisma.user.create({
      data: {
        phone: '+79287365543',
        first_name: 'John',
        last_name: 'Doe',
        password: hashedPassword,
        role: 'USER',
      },
    })
  })

  after(async () => {
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  beforeEach(() => {
    agent = request.agent(app)
  })

  it('should log out the user successfully and destroy the session', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'securePassword123',
      })

    let response = await agent.get('/announcments')
    expect(response.status).to.equal(200)

    response = await agent.get('/logout')
    expect(response.status).to.equal(200)
    expect(response.body).to.have.property('message', 'OK')

    response = await agent.get('/announcments')
    expect(response.status).to.equal(302)
  })

  it('should return an error if user is not authenticated', async () => {
    const response = await request(app).get('/logout')

    expect(response.status).to.equal(400)
    expect(response.body).to.have.property('message', 'Пользователь не авторизован.')
  })
})
