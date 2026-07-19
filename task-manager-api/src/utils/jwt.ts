import jwt from "jsonwebtoken";

export interface JwtPayload {
    userId: number;
}

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateToken(userId: number) {
  return jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}