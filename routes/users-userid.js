module.exports = function (req, res) {
  var fs = require('fs');

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('users-userid', pageContent);
  }

  try {
    var folder = fs.readdirSync(RSN.datadir + '/users/' + req.params.userid);
    pageContent.message = folder;
  } catch (e) {
    console.log(e);
    pageContent.error = 'The given case does not exist.';
  }

  myRender();
};