module.exports = function (req, res) {

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('login', pageContent);
  }

  myRender();
};