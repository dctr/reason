module.exports = function (req, res) {
  var fs = require('fs');

  try {
    var folders = fs.readdirSync(RSN.datadir + '/users');
    var file
    res.locals.users = {};
    for (var i in folders) {
      // TODO This could easly be made async
      file = fs.readFileSync(RSN.datadir + '/users/' + folders[i] +
                             '/description.json', 'utf-8');
      file = JSON.parse(file);
      res.locals.users[folders[i]] = {
        id: folders[i],
        tags: file.tags,
        cases: file.cases
      };
    }
  } catch (e) {
    res.locals.error = 'Somethings wrong in the users database.';
  }

  res.render('users');
};