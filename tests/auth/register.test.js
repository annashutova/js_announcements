import request from 'supertest'
import { expect } from 'chai'
import prisma from '../db_client.js'
import app from '../../app.js'

describe('/register API Endpoint', () => {

  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  after(async () => {
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        phone: '+79287365543',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123',
      })

    expect(response.status).to.equal(200)
    expect(response.body).to.deep.equal({ message: 'Вы успешно зарегистрировались.' })
    afterEach(async () => {
        await prisma.user.deleteMany();
      })
    const user = await prisma.user.findUnique({
      where: { phone: '+79287365543' },
    })
    expect(user).to.not.be.null
    expect(user.first_name).to.equal('John')
    expect(user.last_name).to.equal('Doe')
  })

  it('should return an error for invalid phone number', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        phone: '12345',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123',
      })

    expect(response.status).to.equal(400)
    expect(response.body).to.deep.equal({ message: 'Некорректный номер телефона. Пример: +79287365543.' })
  })

  it('should return an error for an already existing user', async () => {

    await prisma.user.create({
      data: {
        phone: '+79287365543',
        password: 'hashedPassword',
        first_name: 'Existing',
        last_name: 'User',
      },
    })

    const response = await request(app)
      .post('/register')
      .send({
        phone: '+79287365543',
        firstName: 'John',
        lastName: 'Doe',
        password: 'securePassword123',
      })

    expect(response.status).to.equal(400)
    expect(response.body).to.deep.equal({ message: 'Пользователь уже существует.' })
  })
})
