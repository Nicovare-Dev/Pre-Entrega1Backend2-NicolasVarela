import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { user } from '../models/user.js';
import { config } from '../config/config.js';
import passport from '../config/passport.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });

  res.json({ message: 'Login exitoso', token });
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ user: req.user });
  });

export default router;
