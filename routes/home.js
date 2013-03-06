module.exports = function (req, res) {

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('home', pageContent);
  }

  myRender();
};