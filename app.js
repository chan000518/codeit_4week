import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { create } from 'superstruct';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.get('/users', async (req, res) => {
  // 구조 분해 할당
  const { offset = 0, limit = 10, order = "newest"} = req.query
  let orderBy;
  switch(order) {
    case 'oldest':
      orderBy = {createAt : 'asc'};
      break;
    case 'newest':
    default:
      orderBy = {createAt: 'desc'};
  }
  const users = await prisma.user.findMany({
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
  });

  res.send(users);
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  res.send(user);
});

app.post('/users', async (req, res) => {
  // 리퀘스트 바디 내용으로 유저 생성
  const user = await prisma.user.create({
    data: req.body,
  })
  res.status(201).send(user);
});

app.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  // 리퀘스트 바디 내용으로 id에 해당하는 유저 수정
  const user = await prisma.user.update({
    where: { id },
    data: req.body,
  })
  res.send(user);
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  // id에 해당하는 유저 삭제
  await prisma.user.delete({
    where: { id },
  })
  res.sendStatus(204);
});

/*********** products ***********/

app.get('/products', async (req, res) => {
  // 상품 목록 조회
  const { order = "newest", offset = 0, limit = 10, category = null } = req.query;
  let orderBy;
  switch (order) {
    case 'priceLowest':
      orderBy = { price: 'asc' };
      break;
    case 'priceHighest':
      orderBy = { price: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
  }

  const products = await prisma.product.findMany({
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
    where: category ? { category } : {},
  });
  
  res.send(products);
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  // id에 해당하는 상품 조회
  const product = await prisma.product.findUnique({
    where: { id },
  });
  res.send(product);
});

app.post('/products', async (req, res) => {
  // 리퀘스트 바디 내용으로 상품 생성
  const product = await prisma.product.create({
    data: req.body,
  })
  res.status(201).send(product);
});

app.patch('/products/:id', async (req, res) => {
  const { id } = req.params;
  // 리퀘스트 바디 내용으로 id에 해당하는 상품 수정
  const product = await prisma.product.update({
    where: {id},
    data: req.body,
  })
  res.send(product);
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  // id에 해당하는 상품 삭제
  await prisma.product.update({
    where: {id},
  })
  res.sendStatus(204);
});


app.listen(process.env.PORT || 3000, () => console.log('Server Started'));