import request from 'supertest'
import prisma from '../db_client.js'
import { expect } from 'chai'
import app from '../../app.js'
import { hashPassword } from '../../utils/hash.js'

describe('/login API Endpoint', () => {
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

  it('should successfully login a user with correct credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'securePassword123',
      })

    expect(response.status).to.equal(200)
    expect(response.body).to.have.property('message', 'Вы успешно авторизовались')
    expect(response.body).to.have.property('object')
    expect(response.body.object.phone).to.equal('+79287365543')
  })

  it('should return an error for incorrect password', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'wrongPassword',
      })

    expect(response.status).to.equal(400)
    expect(response.body).to.have.property('message', 'Неверный номер телефона или пароль.')
  })

  it('should return an error for non-existent phone number', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        phone: '+70000000000',
        password: 'securePassword123',
      })

    expect(response.status).to.equal(400)
    expect(response.body).to.have.property('message', 'Неверный номер телефона или пароль.')
  })
})
