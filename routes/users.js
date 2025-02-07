var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Đây là trang users');
});

router.get('/login', function(req, res, next) {
  res.send('Đây là trang đăng nhập');
});

router.get('/register', function(req, res, next) {
  res.send('Đây là trang đăng ký');
});

module.exports = router;
