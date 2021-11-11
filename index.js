const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb')

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

        // app.get('/appointments', async (req, res) => {
        //     const email = req.query.email;                                    // ---------
        //     const date = new Date(req.query.date).toLocaleDateString();       // ----------
        //     const query = { email: email, date: date };                        // filter user
        //     // console.log(query);
        //     const cursor = appointmentCollection.find(query);
        //     const appointments = await cursor.toArray();
        //     res.json(appointments);
        // })

        // app.post('/appointments', async (req, res) => {
        //     const appointment = req.body;
        //     // console.log(appointment);
        //     // res.json({ message: 'hello' })
        //     const result = await appointmentCollection.insertOne(appointment);
        //     // console.log(result);
        //     res.json(result);
        // });

        // Post orders API ////////
        app.post('/orders', async (req, res) => {
            const product = req.body;
            console.log('Hit the post API', product);
            const result = await ordersCollection.insertOne(product);
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

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await userCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await userCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }
        })

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