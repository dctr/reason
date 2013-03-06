module.exports = function (req, res) {
  var fs = require('fs');

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('cases-caseid', pageContent);
  }

  try {
    var folder = fs.readdirSync(RSN.datadir + '/cases/' + req.params.caseid);
    pageContent.message = folder;
  } catch (e) {
    console.log(e);
    pageContent.error = 'The given case does not exist.';
  }

  myRender();
};