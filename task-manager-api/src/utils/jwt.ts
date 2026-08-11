import jwt, { type JwtPayload as RawJwtPayload } from "jsonwebtoken";

export interface JwtPayload {
  userId: number;
}

const DEFAULT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1d";
const DEFAULT_ALGORITHM: jwt.Algorithm = "HS256";
const ISSUER = "task-manager-api";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET must be configured before issuing or verifying tokens.",
    );
  }
  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters long for HS256 security.",
    );
  }
  return secret;
}

export function generateToken(userId: number): string {
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new TypeError("generateToken requires a positive numeric userId.");
  }

  const secret = getSecret();
  const payload: JwtPayload = { userId };
  return jwt.sign(payload, secret, {
    algorithm: DEFAULT_ALGORITHM,
    expiresIn: DEFAULT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    issuer: ISSUER,
    subject: String(userId),
  });
}

export function verifyToken(token: string): JwtPayload {
  const secret = getSecret();
  const decoded = jwt.verify(token, secret, {
    algorithms: [DEFAULT_ALGORITHM as jwt.Algorithm],
    issuer: ISSUER,
  }) as RawJwtPayload;

  const userIdRaw = decoded.userId;
  if (
    typeof userIdRaw !== "number" ||
    !Number.isFinite(userIdRaw) ||
    userIdRaw <= 0
  ) {
    const jwtError = new jwt.JsonWebTokenError(
      "Malformed token payload: missing or invalid userId.",
    );
    throw jwtError;
  }
  return { userId: userIdRaw };
}

export function readJwtConfigUnsafe() {
  const secret = process.env.JWT_SECRET;
  return {
    hasSecret: typeof secret === "string" && secret.length > 0,
    secretLength: typeof secret === "string" ? secret.length : 0,
    expiresIn: DEFAULT_EXPIRES_IN,
    algorithm: DEFAULT_ALGORITHM,
    issuer: ISSUER,
  };
}
