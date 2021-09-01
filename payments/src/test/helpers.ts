import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const getId = (): string => new mongoose.Types.ObjectId().toHexString();

export function signin(userId?: string): string[] {
  // Build a JWT payload. { id, email }
  const payload = {
    id: userId ?? getId(),
    email: 'test@test.com',
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build the session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return the string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
}
