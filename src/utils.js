import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)



export default __dirname

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};
