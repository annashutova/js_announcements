import request from 'supertest';
import { expect } from 'chai';
import app from '../../app.js'
import prisma from '../db_client.js'
import { hashPassword } from '../../utils/hash.js'

describe('POST /announcments API Endpoint', () => {
  let agent;
  let user;
  let category;

  beforeEach(async () => {
    agent = request.agent(app);

    const hashedPassword1 = await hashPassword('securePassword123')
    user = await prisma.user.create({
      data: {
        phone: '+79287365543',
        first_name: 'John',
        last_name: 'Doe',
        password: hashedPassword1,
        role: 'USER',
      },
    });

    category = await prisma.category.create({
      data: {
        title: 'Test Category',
      },
    });

    await agent
      .post('/login')
      .send({
        phone: '+79287365543',
        password: 'securePassword123',
      });
  });

  afterEach(async () => {
    await prisma.announcment.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should return 401 if user is not authenticated', async () => {
    const unauthenticatedAgent = request(app);
    const response = await unauthenticatedAgent.post('/announcments').send({
      title: 'Test Announcment',
      description: 'Test Description',
      categoryId: category.id,
    });
    expect(response.status).to.equal(302);
  });

  it('should create a new announcment and return 201', async () => {
    const response = await agent.post('/announcments').send({
      title: 'Test Announcment',
      description: 'Test Description',
      categoryId: category.id,
    });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal('Объявление успешно создано.');
    expect(response.body.object).to.have.property('id');
    expect(response.body.object.title).to.equal('Test Announcment');
    expect(response.body.object.description).to.equal('Test Description');

    const createdAnnouncment = await prisma.announcment.findUnique({
      where: { id: response.body.object.id },
    });
    expect(createdAnnouncment).to.not.be.null;
    expect(createdAnnouncment.title).to.equal('Test Announcment');
    expect(createdAnnouncment.authorId).to.equal(user.id);
  });
});
