export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || "THIS_IS_A_SECRET",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};
