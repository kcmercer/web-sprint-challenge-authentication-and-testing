// Write your tests here


// Imports

const db = require('../data/dbConfig');
const Users = require('./users/users-model');

const request = require('supertest');
const server = require('./server');


// Quick Before everything resets

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('users').truncate();
});


// Make sure that I am not losing it

test('sanity', () => {
  expect(true).not.toBe(false);
});


// General tests

describe('Test the users model', () => {
  test('Table starts empty', async () => {
    const users = await db('users');

    expect(users).toHaveLength(0);
  });

  test('Able to insert a new user', async () => {
    let result = await Users.insert({ username: 'newUserTest', password: 'slorpo' });
    expect(result).toEqual({ id: 1, username: 'newUserTest', password: 'slorpo' });

    let users = await db('users');
    expect(users).toHaveLength(1);

    await Users.insert({ username: 'newUserTest2', password: 'squimbus' });
    users = await db('users');
    expect(users).toHaveLength(2);
  });

  test('Able to get a user by ID', async () => {
    const [id] = await db('users').insert({ username: 'idTest', password: 'grumpus' });
    let result = await Users.getById(id);

    expect(result).toHaveProperty('username', 'idTest');
  });

  test('Able to update a user', async () => {
    const [id] = await db('users').insert({ username: 'updateTest', password: 'flembur' });
    let result = await Users.update(id, { username: 'updateTest' });

    expect(result).toEqual({ id: 1, username: 'updateTest', password: 'flembur' });
    result = await Users.getById(id);
    expect(result).toEqual({ id: 1, username: 'updateTest', password: 'flembur' });
  });

  test('Able to delete a user', async () => {
    let result = await Users.insert({ username: 'deleteTest', password: 'truglump' });
    result = await Users.getById(result.id);
    expect(result).toHaveProperty('username', 'deleteTest');

    result = await Users.remove(result.id);
    expect(result).toEqual({ id: 1, username: 'deleteTest', password: 'truglump' });

    result = await Users.getById(result.id);
    expect(result).not.toBeDefined();
  });
});


// Endpoint testing


// Post (REGISTER)

describe('Testing server endpoints', () => {
  test('[POST] /auth/register - Able to register successfully', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'fwem', password: 'quimble' });
    
      const result = await db('users')
        .where('username', 'fwem')
        .first()

      expect(result).toMatchObject({ username: 'fwem' });
  });

  test('[POST] /auth/register - Password has been hashed', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'squim', password: 'librum' });
    
      const result = await db('users')
        .where('username', 'squim')
        .first()

      expect(result).not.toHaveProperty('password', 'librum');
  });

  
  //post (LOGIN)

  test('[POST] /auth/login - Welcome message appears', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'strus', password: 'krelmus' });

    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'strus', password: 'krelmus' });

    expect(res.text).toMatch(/welcome, strus/i);
  });

  test('[POST] /auth/login - Invalid credentials prevents login', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'prelsum', password: 'yultooke' });

    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'normalUsername', password: 'normalPassword' });

    expect(res.text).toMatch(/This username is invalid/i);
  });


  //get (JOKES)

  test('[GET] /api/jokes - Token is required', async () => {
    const res = await request(server).get('/api/jokes');

    expect(res.text).toMatch(/token required/i);
  });

  test('[GET] /api/jokes - Invalid token prevents joking around', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'oppalumpus');

    expect(res.text).toMatch(/token invalid/i);
  });
});