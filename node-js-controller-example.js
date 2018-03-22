const config = require('config');
const _ = require('lodash');
const passport = require('passport');
const m = require('../common/m');
const User = require('../models/User');
const DBUtil = require('../common/DB_Util');
const emailerController = require('./EmailerController');

const registrationController = {
  createUser(data) {
    return new Promise((res, rej) => {
      User.register(new User(data), data.password, (err, obj) => {
        if (err) {
          console.log('error while user register!', err);
          return rej(err);
        }
        console.log('about to create company from user', obj);
        DBUtil.createCompany(obj);
        console.log('user registered!');
        return res(obj);
      });
    });
  },
  async signUp(req, res, next) {
    try {
      const { body } = req || {};
      body.role = 'supplier';
      body.username = body.email;
      body.status = 'waiting for approval';
      await registrationController.createUser(body);
      await registrationController.sendEmailsAfterRegistration(body);
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  },
  sendEmailsAfterRegistration(opts) {
    return new Promise(async (res) => {
      const admins = await m.find({ model: User, query: { role: 'admin' } });
      _.each(admins, async (admin) => {
        await emailerController.sendEmail({
          type: 'admin',
          subject: 'New User have been registred',
          to: admin.email,
          data: opts,
        });
      });
      await emailerController.sendEmail({
        type: 'userInfo',
        subject: 'Registration',
        to: opts.email,
        data: opts,
      });
      res();
    });
  },
  createSuperUsers(req, res) {
    try {
      const users = config.get('superAdmins');
      _.each(users, async (user, key) => {
        const findUser = await m.findOne({ model: User, query: { email: user.email } });
        if (!findUser) {
          await registrationController.createUser(user);
        }
        key === users.length - 1 && res.send('Hi Super');
      });
    } catch (err) {
      res.send('Err');
    }
  },
  login() {
    return passport.authenticate('local', {
      successRedirect: '/home',
      failureRedirect: '/login',
      failureFlash: true,
    });
  },
  async forgot(req, res) {
    try {
      const { body } = req || {};
      const user = await m.findOne({ model: User, query: { email: body.email, role: 'supplier' } });
      if (!user) {
        res.status(404).send('Email not found');
      } else {
        const token = m.createToken({ email: body.email });
        await emailerController.sendEmail({
          type: 'userReset',
          subject: 'Reset Password',
          to: user.email,
          data: { token: `http://${req.headers.host}/reset/${token}` },
        });
        res.status(200).send('Ok');
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Something wrong');
    }
  },
  async resetPassword(req, res) {
    const { token } = req.params;
    const { body } = req;
    if (!(token && token.length)) {
      res.redirect('/login');
    } else {
      const decodedToken = await m.vefifyToken(token);
      const user = await m.findOne({ model: User, query: { email: decodedToken.email, role: 'supplier' } });
      if (!user) {
        res.status(404).send('Email not found');
      } else {
        user.setPassword(body.password, () => {
          user.save((err) => {
            if (err) {
              res.status(404).send('Something wrong');
            }
            res.status(200).send('Your password was changed');
          });
        });
      }
    }
  },
};

module.exports = registrationController;
