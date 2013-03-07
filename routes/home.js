module.exports = function (req, res) {

  res.locals.sess = req.session.user_id;
  req.session.user_id = 'myuserid';
  res.render('home');
};