const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iyv3j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db('matleyHeadphone');
        const productsCollection = database.collection('products');
        const moreProductsCollection = database.collection('moreProducts');
        const userCollection = database.collection('users');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');

        // Get products API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const product = await cursor.toArray();
            res.send(product);
        });


        // Get more products API
        app.get('/moreProducts', async (req, res) => {
            const cursor = moreProductsCollection.find({});
            const product = await cursor.toArray();
            res.send(product);
        });

        // Post more product API
        app.post('/moreProducts', async (req, res) => {
            const product = req.body;
            // console.log('Hit the post API', product);
            const result = moreProductsCollection.insertOne(product);
            res.json(result);
        });

        // Get my booking API
        app.get("/myBooking/:email", async (req, res) => {
            const result = await ordersCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        // Delete my booking API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            // console.log('Delete success', result);
            res.json(result);
        });

        // Post orders API ////////
        app.post('/orders', async (req, res) => {
            const product = req.body;
            // console.log('Hit the post API', product);
            const result = await ordersCollection.insertOne(product);
            res.json(result);
        });


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            // console.log('put', user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log(user, 'admin')
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);

        });

        // Get reviews API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        // Post reviews API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log('Hit the post API', review);
            const result = reviewsCollection.insertOne(review);
            res.json(result);
        });

        // Delete product manege API
        app.delete('/moreProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await moreProductsCollection.deleteOne(query);
            // console.log('Delete success', result);
            res.json(result);
        });

        // Get manage orders API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

        // Delete my booking API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            // console.log('Delete success', result);
            res.json(result);
        });

        // status update
        app.put("/orders/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            console.log(req.body)
            const result = await ordersCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                },
            });
            res.send(result);
            // console.log(result);
        });


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Matley Headphone')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})