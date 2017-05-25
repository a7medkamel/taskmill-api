var passport    = require('passport')
  , Strategy    = require('passport-jwt').Strategy
  , ExtractJwt  = require('passport-jwt').ExtractJwt
  , config      = require('config')
  , account_sdk = require('taskmill-core-account-sdk')
  ;

passport.use(new Strategy(
  {
      jwtFromRequest    : ExtractJwt.fromAuthHeaderWithScheme('Bearer')
    , secretOrKey       : config.get('jwt.public')
    , algorithms        : [ 'RS256' ]
    // , issuer          : 'accounts.examplesoft.com'
    // , audience        : 'yoursite.net'
    , passReqToCallback : true
    // , userProperty      : 'jwt_payload'
  }
  , (req, payload, done) => {
      // todo [akamel] this token is not being used, should be
      account_sdk
        .findAccountById(payload.sub, { token : req.get('Authorization') })
        .asCallback(done);
  }
));

module.exports = passport.authenticate('jwt', { /*session: false,*/ failWithError: true, assignProperty : 'user' });
