import * as s from 'superstruct';
import isEmail from 'is-email';

export const CreateUser = s.object({
    // 새로운 타입 생성
    // isEmail : 문자열을 받아 불리언을 반환하는 함수
    email : s.define('Email', isEmail),
    // 사이즈 제한
    firstName: s.size(s.string(), 1, 30),
    lastName: s.size(s.string(), 1, 30),
    // 타입  검사
    address: s.string(),
});

export const PatchUser = s.partial(CreateUser);

export const CreateProduct = s.object({
    name: s.size(s.string(), 1, 60),
    description: s.string(),
    category: s.enums(['FASHION', 'SPORTS', 'ELECTRONICS', 'HOME_INTERIOR', 'HOUSEHOLD_SUPPLIES', 'KITCHENWARE']),
    price: s.min(s.number(), 0),
    stock: s.min(s.integer(), 0),
});

export const PatchProduct = s.partial(CreateProduct);