var router = require('express').Router();
var log = require('lib/log')(module);

router.post("/", function(req, res) {
    log.info("Destroy user session ID " + req.session.user);
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
