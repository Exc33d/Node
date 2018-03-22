const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const googleMapsClient = require('@google/maps').createClient({
  key: 'SECRET-KEY',
});

const m = {
  findOne({ model, query }) {
    return new Promise((res, rej) => {
      model.findOne(query, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });
  },
  findOneAndUpdate({ model, query, update }) {
    return new Promise((res, rej) => {
      model.findOneAndUpdate(query, update, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });
  },
  findOneAndRemove({ model, query }) {
    return new Promise((res, rej) => {
      model.findOneAndRemove(query, (err, data) => {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });
  },
  find({
    model, query, limit, params, sort, skip,
  }) {
    limit = limit || 20;
    sort = sort || ('updateAt');
    skip = skip || 0;
    params = params || {};
    return new Promise((res, rej) => {
      model.find(query, params).limit(+limit).skip(+skip).sort(sort)
        .exec((err, data) => {
          if (err) {
            rej(err);
          }
          res(data);
        });
    });
  },
  countOfModel({ model, query }) {
    return new Promise((res, rej) => {
      model.find(query).count((err, count) => {
        if (err) {
          rej(err);
        } else {
          res(count);
        }
      });
    });
  },
  returnFile(pathToFile) {
    return fs.readFileSync(path.resolve(__dirname, pathToFile), 'utf-8');
  },
  mkDirRecursive(targetDir, opts) {
    const isRelativeToScript = opts && opts.isRelativeToScript;
    const { sep } = path;
    const initDir = path.isAbsolute(targetDir) ? sep : '';

    targetDir.split(sep).reduce((parentDir, childDir) => {
      const baseDir = isRelativeToScript ? `${__dirname}/../` : '.';
      const curDir = path.resolve(baseDir, parentDir, childDir);
      try {
        fs.mkdirSync(curDir);
        console.log(`Directory ${curDir} created!`);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }

        console.log(`Directory ${curDir} already exists!`);
        return curDir;
      }

      return curDir;
    }, initDir);
  },
  createToken(data) {
    data = data || {};
    data.exp = data.exp || Math.floor(Date.now() / 1000) + (60 * 60);
    const key = this.returnFile('../config/private.key');
    return jwt.sign(data, key);
  },
  vefifyToken(token) {
    return new Promise((res, rej) => {
      const key = this.returnFile('../config/private.key');

      jwt.verify(token, key, (err, decoded) => {
        if (err) {
          rej(err);
        }
        res(decoded);
      });
    });
  },
  getGeocode(address) {
    return new Promise((res, rej) => {
      googleMapsClient.geocode({
        address,
      }, (err, response) => {
        if (err) {
          rej(err);
          console.log(response.json.results);
        }
        res(response.json.results);
      });
    });
  },
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
};

module.exports = m;
