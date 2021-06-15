const express = require('express')
const app = express()
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
require('dotenv').config();

const port = 1300;

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1xgou.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookCollection = client.db("bookShop").collection("books");
    const orderCollection = client.db("bookShop").collection("orders");

    app.get('/books', (req, res) => {
        bookCollection.find()
            .toArray((err, bookItems) => {
                res.send(bookItems);
            });
    });

    app.get('/checkOut/:bookId', (req, res) => {
        bookCollection.find({ bookId: req.params.bookId })
            .toArray((err, documents) => {
                res.send(documents[0]);
            });
    });

    app.get('/order', (req, res) => {
        const queryEmail = req.query.email;
        if (queryEmail) {
            orderCollection.find({ email: queryEmail })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        }
        else {
            res.status(401).send('Unauthorized Access')
        }
    });

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        console.log('Add new order', newOrder)
        orderCollection.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newOrder);
    });

    app.post('/addBooks', (req, res) => {
        const newBooks = req.body;
        console.log('Adding new book:', newBooks);
        bookCollection.insertOne(newBooks)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.delete('/removeBook/:bookId', (req, res) => {
        bookCollection.deleteOne({ bookId: req.params.bookId })
            .then(result => {
            })
    })
});



app.listen(process.env.PORT || port)