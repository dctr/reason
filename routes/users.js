module.exports = function (req, res) {

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('users', pageContent);
  }

  pageContent.users = {
    foo: {
      tags: ['nice', 'pretty', 'handsome'],
      cases: [1, 2]
    },
    bar: {
      tags: ['handsome', 'fairly usefull'],
      cases: [1, 3]
    }
  }

  myRender();
};