import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { assert } from 'superstruct';
import { CreateUser, PatchUser } from './structs.js';
import { CreateProduct, PatchProduct } from './structs.js';


const prisma = new PrismaClient();

const app = express();
app.use(express.json());

// 에러 처리
function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (e.name === 'StructError' ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        res.status(400).send({ message: e.message });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError
        && e.code === 'P2025'
      ) {
        res.sendStatus(404);
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
}

app.get('/users', asyncHandler(async (req, res) => {
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
}));

app.get('/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  res.send(user);
}));

app.post('/users', asyncHandler(async (req, res) => {
  // 유효성 검사
  assert(req.body, CreateUser);
  // 리퀘스트 바디 내용으로 유저 생성
  const user = await prisma.user.create({
    data: req.body,
  });
  res.status(201).send(user);
}));

app.patch('/users/:id', asyncHandler(async (req, res) => {
  // 유효성 검사
  assert(req.body, PatchUser);
  const { id } = req.params;
  // 리퀘스트 바디 내용으로 id에 해당하는 유저 수정
  const user = await prisma.user.update({
    where: { id },
    data: req.body,
  })
  res.send(user);
}));

app.delete('/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  // id에 해당하는 유저 삭제
  await prisma.user.delete({
    where: { id },
  })
  res.sendStatus(204);
}));

/*********** products ***********/

app.get('/products', asyncHandler(async (req, res) => {
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
}));

app.get('/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  // id에 해당하는 상품 조회
  const product = await prisma.product.findUnique({
    where: { id },
  });
  res.send(product);
}));

app.post('/products', asyncHandler(async (req, res) => {
  assert(req.body, CreateProduct);
  // 리퀘스트 바디 내용으로 상품 생성
  const product = await prisma.product.create({
    data: req.body,
  })
  res.status(201).send(product);
}));

app.patch('/products/:id', asyncHandler(async (req, res) => {
  assert(req.body, PatchProduct);
  const { id } = req.params;
  // 리퀘스트 바디 내용으로 id에 해당하는 상품 수정
  const product = await prisma.product.update({
    where: {id},
    data: req.body,
  })
  res.send(product);
}));

app.delete('/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  // id에 해당하는 상품 삭제
  await prisma.product.update({
    where: {id},
  })
  res.sendStatus(204);
}));

app.listen(process.env.PORT || 3000, () => console.log('Server Started'));