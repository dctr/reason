module.exports = function (req, res) {

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('TPL', pageContent);
  }

  myRender();
};