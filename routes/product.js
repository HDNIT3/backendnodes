var express = require('express');
var router = express.Router();

const multer = require('multer');
//Thiết lập nơi lưu trữ và tên file
let storage = multer.diskStorage({
destination: function (req, file, cb) {
  cb(null, './public/images')
},
filename: function (req, file, cb) {
  cb(null, file.originalname)
}
})
//Kiểm tra file upload
function checkFileUpLoad(req, file, cb){
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
    return cb(new Error('Bạn chỉ được upload file ảnh'));
  }
  cb(null, true);
}
//Upload file
let upload = multer({ storage: storage, fileFilter: checkFileUpLoad });

// const products = [
//   { id: 1, name: "product 1", price: 100, categoryId: 1,img: "1.jpeg", description: "Description 1"},
//   { id: 2, name: "product 2", price: 200, categoryId: 2,img: "2.jpeg", description: "Description 2"},
//   { id: 3, name: "product 3", price: 300, categoryId: 3,img: "3.jpeg", description: "Description 3"},
//   { id: 4, name: "product 4", price: 400, categoryId: 1,img: "4.jpeg", description: "Description 4"},
//   { id: 5, name: "product 5", price: 500, categoryId: 2,img: "5.jpeg", description: "Description 5"},
//   { id: 6, name: "product 6", price: 600, categoryId: 3,img: "6.jpeg", description: "Description 6"},
// ];

// import db
const connectDB = require('../models/db');


/* GET users listing. */
router.get('/', async function(req, res, next) {
  const db = await connectDB();
  const products = await db.collection('products').find().toArray();
  res.render('product', {products: products});
});

router.get('/add', function(req, res, next) {
  res.render('addProduct');
});

router.get('/delete/:id', async function(req, res, next) {
  const db = await connectDB();
  const id = req.params.id;
  await db.collection('products').deleteOne({id: parseInt(id)});
  res.redirect('/product');
});

router.post('/add', upload.single('img'), async function(req, res, next) {
  const db = await connectDB();
  const products = await db.collection('products').find().toArray();
  const id = products.length == 0 ? 1 : products[products.length - 1].id + 1;
  const product = {
    id,
    name: req.body.name,
    price: req.body.price,
    categoryId: parseInt(req.body.categoryId),
    img: req.file.originalname,
    description: req.body.description
  };
  await db.collection('products').insertOne(product);
  res.redirect('/product');
});

router.get('/edit/:id', async function(req, res, next) {
  const db = await connectDB();
  const id = req.params.id;
  const product = await db.collection('products').findOne({id: parseInt(id)});
  res.render('editPro', {product: product});  
});

router.post('/edit', upload.single('img'), async function(req, res, next) {
  const db = await connectDB();
  let id = parseInt(req.body.id);
  let {name, price, categoryId, description} = req.body;
  let img = req.file ? req.file.originalname : req.body.imgOld;
  let editProduct = {
    id,
    name,
    price,
    categoryId: parseInt(categoryId),
    img,
    description
  };
  await db.collection('products').updateOne({id}, {$set: editProduct});
  res.redirect('/product');
});



module.exports = router;
