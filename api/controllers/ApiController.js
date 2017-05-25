/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var _                 = require('lodash')
   , Promise           = require('bluebird')
   , config            = require('config')
   , metering          = require('taskmill-api-metering')
 	;

var twilio_key 				= config.get('twilio.key')
	, twilio_secret 		= config.get('twilio.secret')
	, twilio            = require('twilio')(twilio_key, twilio_secret)
	, nodemailer        = require('nodemailer')
	, mailgun_transport = require('nodemailer-mailgun-transport')
	, mailgun_key 			= config.get('mailgun.api-key')
	, mailgun_domain 		= config.get('mailgun.domain')
	, mailgun_opts 			= { auth : {
															api_key : mailgun_key
														, domain 	: mailgun_domain
												}}
	, mailgun 					= nodemailer.createTransport(mailgun_transport(mailgun_opts));

module.exports = {
	email: (req, res, next) => {
    metering
      .can('email', req.user)
      .then((can) => {
        var options = _.omit(req.body, 'attachments');

				return mailgun.sendMail(options);
      })
      .then(() => {
        res.send({ message : 'OK' })
      })
      .then(() => {
        metering.did('email', req.user);
      })
      .catch((err) => {
        res.status(403).send({
          message : err.message
        });
      });
  },

  sms: (req, res, next) => {
    metering
      .can('sms', req.user)
      .then((can) => {
        var options = req.body;

        options.from = config.get('twilio.phone');

				return twilio.sendMessage(options);
      })
      .then(() => {
        res.send({ message : 'OK' })
      })
      .then(() => {
        metering.did('sms', req.user);
      })
      // todo [akamel] respond with something sensible and mask private info
      .catch((err) => {
        res.status(403).send({
          message : err.message
        });
      });
  },

	phone: (req, res, next) => {
    metering
      .can('phone', req.user)
      .then((can) => {
        var options = req.body;

        options.from = config.get('twilio.phone');

        options.url = url.format({
            host      : 'twimlets.com'
          , protocol  : 'http'
          , pathname  : 'echo'
          , query     : {
              Twiml : options.twiml
          }
        });

        delete options.twiml;

				return twilio.makeCall(options);
      })
      .then(() => {
        res.send({ message : 'OK' })
      })
      .then(() => {
        metering.did('sms', req.user);
      })
      // todo [akamel] respond with something sensible and mask private info
      .catch((err) => {
        res.status(403).send({
          message : err.message
        });
      });
  }
};
