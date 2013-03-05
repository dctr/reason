module.exports = function (req, res) {
  var fs = require('fs');

  var render = function (arguments) {
    res.render('cases', arguments);
  }

  try {
    var message = fs.readdirSync(RSN.datadir);
    if (typeof message === 'undefined') throw {
      name: 'DirectoryReadError',
      message: 'Could not read the given directory.'
    }
  } catch (e) {
    render({error: e.name + ': ' + e.message});
  }
};
