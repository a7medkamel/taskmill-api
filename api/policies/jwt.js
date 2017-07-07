var Promise     = require('bluebird')
  , passport    = require('passport')
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

module.exports = (req, res, next) => {
  let opts = {
    /*session: false,*/
      failWithError   : true
    , assignProperty  : 'user'
  };

  Promise
    .fromCallback((cb) => passport.authenticate('jwt', opts)(req, req, cb))
    .asCallback((err, result) => {
      // todo [akamel] consolidate errorify
      if (!err) {
        return next(err, result);
      }

      res.status(401).send({
          message         : 'unauthorized'
        , status          : 401
        , ref             : 'https://breadboard.io/help#auth-tokens'
        , hep             : 'This call requires authentication, you must either be logged in or provide a valid token.'
      });
    });
  ;
}
