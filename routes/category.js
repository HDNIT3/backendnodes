var express = require('express');
var router = express.Router();

const categories = [
  { id: 1, name: "category 1", img: "dm1.jpeg"},
  { id: 2, name: "category 2", img: "dm2.jpeg"},
  { id: 3, name: "category 3", img: "dm3.jpeg"},
];

router.get('/', function(req, res, next) {
  let listCategory = "<h1>Danh sách danh mục</h1>";
  listCategory += "<ul>";
  categories.forEach(category => {
    listCategory += `<li>${category.name}</li>`;
  });
  listCategory += "</ul>";
  res.send(listCategory);
});

router.get('/add', function(req, res, next) {
  res.send('Đây là trang thêm danh mục');
});

router.get('/edit', function(req, res, next) {
  res.send('Đây là trang sửa danh mục');
});

module.exports = router;
