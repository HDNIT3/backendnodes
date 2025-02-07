// Thư viện MongoClient giúp kết nối với MongoDB
const MongoClient = require('mongodb').MongoClient;


// URL của cơ sở dữ liệu MongoDB
const url = 'mongodb://localhost:27017';
// Tên database 
const dbName = 'bookshop';


async function connectDB() {
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);;
}

module.exports = connectDB;