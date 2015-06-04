var router = require('express').Router();

router.post("/", function(req, res) {
  console.log("logout - destroy user session");
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
