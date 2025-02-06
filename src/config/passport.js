import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { user } from '../models/user.js';
import { config } from '../config/config.js'; 

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.token]),
  secretOrKey: config.jwtSecret,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await user.findById(jwt_payload.id);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

export default passport;
