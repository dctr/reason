module.exports = function (req, res) {
  var fs = require('fs');

  try {
    var folder = fs.readdirSync(RSN.datadir + '/cases/' + req.params.caseid);
    res.locals.message = folder;
  } catch (e) {
    console.log(e);
    res.locals.error = 'The given case does not exist.';
  }

  res.render('casesCaseid');
};