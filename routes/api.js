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


const connectDB = require('../models/db');


// gửi dữ liệu lên server
router.get('/products', async function(req, res, next) {
    try{
        const db = await connectDB();
        const products = await db.collection('products').find().toArray();
        if(products.length > 0){
            res.status(200).json(products);
        }else{
            res.status(404).json({message: 'Không tìm thấy'});
        }
    }catch(err){
        res.status(404).json({message: 'Không kết nối được'});
    }
});

router.get('/categories', async function(req, res, next) {
  try{
    const db = await connectDB();
    const categories = await db.collection('categories').find().toArray();
    if(categories.length > 0){
      res.status(200).json(categories);
    }else{
      res.status(404).json({message: 'Không tìm thấy'});
    }
  }catch(err){
    res.status(404).json({message: 'Không kết nối được'});
  }
});

// 1 sản phẩm
router.get('/products/:id', async function(req, res, next) {
    try{
        const db = await connectDB();
        const product = await db.collection('products').findOne({id: parseInt(req.params.id)});
        if(product){
            res.status(200).json(product);
        }else{
            res.status(404).json({message: 'Không tìm thấy'});
        }
    }catch(err){
        res.status(404).json({message: 'Không kết nối được'});
    }
});

// thêm sản phẩm
router.post('/add', upload.single('img'), async function(req, res, next) {
  try{
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
    res.status(200).json(product);
  }catch(err){
    res.status(404).json({message: 'Thêm sản phẩm thất bại'});
  }
});

// sửa sản phẩm
router.put('/edit/:id', upload.single('img'), async function(req, res, next) {
  try{
    const db = await connectDB();
    const product = await db.collection('products').findOne({id: parseInt(req.params.id)});
    const id = product.id;
    const {name, price, categoryId, description} = req.body;
    if(req.file){
      var img = req.file.originalname;
    }else{
      let productOld = await db.collection('products').findOne({id: parseInt(req.params.id)});
      var img = productOld.img;
    }
    const editProduct = {
      id,
      name,
      price,
      categoryId: parseInt(categoryId),
      img,
      description
    };
    await db.collection('products').updateOne({id}, {$set: editProduct});
    res.status(200).json(editProduct);
  }catch(err){
    res.status(404).json({message: 'Sửa sản phẩm thất bại'});
  }
});

// xóa sản phẩm
router.delete('/delete/:id', async function(req, res, next) {
  try{
    const db = await connectDB();
    await db.collection('products').deleteOne({id: parseInt(req.params.id)});
    res.status(200).json({message: 'Xóa sản phẩm thành công'});
  }catch(err){
    res.status(404).json({message: 'Xóa sản phẩm thất bại'});
  }
});

// lấy danh mục
router.get('/products/categoryId/:id', async function(req, res, next) {
  try{
    const db = await connectDB();
    const products = await db.collection('products').find({categoryId: parseInt(req.params.id)}).toArray();
    if(products.length > 0){
      res.status(200).json(products);
    }else{
      res.status(404).json({message: 'Không tìm thấy'});
    }
  }catch(err){
    res.status(404).json({message: 'Không kết nối được'});
  }
});

// lấy danh muc tên 
router.get('/products/categoryName/:name', async function(req, res, next) {
  try{
    const db = await connectDB();
    const categories = await db.collection('categories').findOne({name: req.params.name});
    const products = await db.collection('products').find({categoryId: categories.id}).toArray();
    if(products.length > 0){
      res.status(200).json(products);
    }else{
      res.status(404).json({message: 'Không tìm thấy'});
    }
  }catch(err){
    res.status(404).json({message: 'Không kết nối được'});
  }
});

router.get('/search_products/name/:name', async function(req, res, next) {
  const name = req.params.name;
  const db = await connectDB();
  const products = await db.collection('products').find({name: {$regex: name, $options: 'i'}}).toArray();
  if (products.length == 0){
    res.status(404).json({message: 'Không tìm thấy sản phẩm'});
  }
  else{
    res.status(200).json(products);
  }
});

// tìm sản phẩm hot
router.get('/search_products/hot', verifyToken, async function(req, res, next) {
  try{
    const db = await connectDB();
    const products = await db.collection('products').find({hot: "true"}).toArray();
    if (products.length == 0){
      res.status(404).json({message: 'Không tìm thấy sản phẩm hot'});
    }
    else{
      res.status(200).json(products);
    }
  }catch(err){
    res.status(500).json({message: 'Lỗi thể tìm sản phẩm hot'});
  }
});

const bcrypt = require('bcrypt');

router.post('/users/register',  async function(req, res, next) {
  const {username, password, email} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {username, password: hashedPassword, email, isadmin: "No"};
  const db = await connectDB();
  let userMail = await db.collection('users').findOne({email});
  if(userMail){
    res.status(409).json({message: 'Email đã tồn tại'});
  }else{
    try{
      let lastUser = await db.collection('users').find().sort({id: -1}).limit(1).toArray();
      let userId = lastUser.length == 0 ? 1 : lastUser[0].id + 1;
      user.id = userId;
      await db.collection('users').insertOne(user);
      res.status(200).json({message: 'Đăng ký thành công'});
    }catch(err){
      res.status(404).json({message: 'Đăng ký thất bại'});
    }
  }
});

// chức năng login
const jwt = require('jsonwebtoken');
router.post('/users/login', async function(req, res, next) {
  const {email, password} = req.body;
  const db = await connectDB();
  const user = await db.collection('users').findOne({email});
  if(!user){
    res.status(403).json({message: 'Email không tồn tại'});
  }else{
    const isPasswordValid = await bcrypt.compare(password, user.password);  
    if(isPasswordValid){  
      const token = jwt.sign({email: user.email, isadmin: user.isadmin}, 'secretabcxyz', {expiresIn: '30s'});
      res.status(200).json({message: 'Đăng nhập thành công', user, token});
    }else{
      res.status(401).json({message: 'Mật khẩu không chính xác'});
    }
  }
});

// hàm xác thực token
function verifyToken(req, res, next){
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined'){
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    jwt.verify(req.token, 'secretabcxyz', (err, authData)=>{
      if(err){
        res.status(403).json({message: "Không có quyền truy cập"});
      }else{
        next();
      }
    })
  }else{
    res.status(403).json({message: "Không có quyền truy cập"});
  }
}

module.exports = router;