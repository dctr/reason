module.exports = function (req, res) {
  var fs = require('fs');

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('users', pageContent);
  }

  try {
    var folders = fs.readdirSync(RSN.datadir + '/users');
    var file
    pageContent.users = {};
    for (var i in folders) {
      // TODO This could easly be made async
      file = fs.readFileSync(RSN.datadir + '/users/' + folders[i] +
                             '/description.json', 'utf-8');
      file = JSON.parse(file);
      pageContent.users[folders[i]] = {
        id: folders[i],
        tags: file.tags,
        cases: file.cases
      };
    }
  } catch (e) {
    pageContent.error = 'Somethings wrong in the users database.';
  }

  myRender();
};