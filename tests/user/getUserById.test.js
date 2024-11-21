import request from 'supertest'
import { expect } from 'chai'
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('/users/:id API Endpoint', () => {
  let agent

  beforeEach(async () => {
    agent = request.agent(app)

    const hashedPassword1 = await hashPassword('securePassword123')
    await prisma.user.create({
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
          first_name: 'Jane',
          last_name: 'Doe',
          password: hashedPassword3,
          role: 'ADMIN',
        },
      })
  })

  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  after(async () => {
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('should return 400 if id is not a number', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'securePassword123',
      })
    const response = await agent.get('/users/abc')
    expect(response.status).to.equal(400)
    expect(response.text).to.equal('id должно быть числом.')
  })

  it('should return 403 if user tries to access another user\'s data', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'securePassword123',
      })
    const response = await agent.get('/users/2')
    expect(response.status).to.equal(403)
    expect(response.text).to.equal('У вас нет доступа к данной странице.')
  })

  it('should return 404 if user is not found', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365545',
        password: 'adminPassword123',
      })
    const response = await agent.get('/users/99999')
    expect(response.status).to.equal(404)
    expect(response.text).to.equal('Пользователь с id = 99999 не найден.')
  })

  it('should return 200 and user data for the authenticated user', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'securePassword123',
      })
    const response = await agent.get('/users/1')
    expect(response.status).to.equal(200)
    expect(response.body.id).to.equal(1)
    expect(response.body.phone).to.equal('+79287365543')
  })

  it('should return 200 and user data for admin', async () => {
    await agent
      .post('/login')
      .send({
        phone: '+79287365545',
        password: 'adminPassword123',
      })

    const response = await agent.get('/users/2')
    expect(response.status).to.equal(200)
    expect(response.body.id).to.equal(2)
  })
})
