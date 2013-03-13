module.exports = function (req, res) {
  var fs = require('fs');

  // Convenience
  var pageContent = {};
  var myRender = function () {
    res.render('cases', pageContent);
  }

  try {
    var folders = fs.readdirSync(RSN.casesdir);
    var file
    pageContent.cases = {};
    for (var i in folders) {
      // TODO This could easly be made async
      file = fs.readFileSync(RSN.casesdir + folders[i] +
                             '/description.json', 'utf-8');
      file = JSON.parse(file);
      pageContent.cases[folders[i]] = {
        id: folders[i],
        creationDate: file.creationDate,
        summary: file.summary
      };
    }
  } catch (e) {
    pageContent.error = 'Somethings wrong in the cases database.';
  }

  myRender();
};
