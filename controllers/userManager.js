module.exports = function (req, res, next) {
  // Make some session vars available to the template.
  res.locals.csrf = req.session._csrf;
  res.locals.user = req.session.user;

  // Check cookie for login information
  // Set locals' user var
  console.log(res.locals);
  res.locals.message = '';
  console.log(req.session);
  next();
}