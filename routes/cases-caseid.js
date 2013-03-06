module.exports = function (req, res) {
  var fs = require('fs');

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('cases-caseid', pageContent);
  }

  var caseid = req.params.caseid;

  pageContent.message = caseid;
  myRender();
};