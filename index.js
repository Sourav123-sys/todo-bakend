
//import
const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const port = process.env.PORT || 4000
const jwt = require('jsonwebtoken');

//middleware
app.use(bodyParser.json())
//app.use(cors())
const corsConfig = {
    origin: true,
    credentials: true,
  }
  app.use(cors(corsConfig))
  app.options('*', cors(corsConfig))


  function checkJwt(req, res, next) {
    const hederAuth = req.headers.authorization
    if (!hederAuth) {
        return res.status(401).send({ message: 'unauthorized access.try again' })
    }
    else {
        const token = hederAuth.split(' ')[1]
     //   console.log({token});
        jwt.verify(token,process.env.ACCESS_JWT_TOKEN, (err, decoded) => {
            if (err) {
               // console.log(err);
                return res.status(403).send({ message: 'forbidden access' })
            }
         //   console.log('decoded', decoded);
            req.decoded = decoded;
            next()
        })
    }
  //  console.log(hederAuth, 'inside chckjwt');
   
}


//connect to db


//connect to db
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eowzq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)
//console.log(process.env.ACCESS_JWT_TOKEN);
function checkJwt(req, res, next) {
    const hederAuth = req.headers.authorization
    if (!hederAuth) {
        return res.status(401).send({ message: 'unauthorized access.try again' })
    }
    else {
        const token = hederAuth.split(' ')[1]
        //console.log({token});
        jwt.verify(token,process.env.ACCESS_JWT_TOKEN, (err, decoded) => {
            if (err) {
              //  console.log(err);
                return res.status(403).send({ message: 'forbidden access' })
            }
            //console.log('decoded', decoded);
            req.decoded = decoded;
            next()
        })
    }
   // console.log(hederAuth, 'inside chckjwt');
   
}
async function run() {
    try {

        await client.connect();
        console.log("todo connect")
        const taskCollection = client.db('TODO').collection('tasks')
        const usersCollection = client.db('TODO').collection('users')
     

        //api create

        //get task from db 
        app.get("/tasks", async (req, res) => {
               
            const tasks = await taskCollection.find({}).toArray();
            
            res.send(tasks);
        });
        //insert tasks 
        app.post('/tasks', async (req, res) => {

            const addTask = req.body;

            const result = await taskCollection.insertOne(addTask );
            res.send(result)
        })
        //get task by id
        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const item = await taskCollection.findOne(query)
            res.send(item)
        })

//update task 
app.patch('/update/:id',  async (req, res) => {
        const id = req.params.id
        const newTools = req.body
     //   console.log(newTools,"update")
        const query = { _id: ObjectId(id) }
        const product =await taskCollection.findOne(query)
      //  console.log(product,'prd');
        const options = { upsert: true };
        const updateDoc = {
            $set:newTools
        }
        const result = await taskCollection.updateOne(query, updateDoc, options)
        res.send(result);
    
});
//todo delete
app.delete("/task/:id", async (req, res) => {
   
    const id = req.params.id;  
      const result =  await taskCollection.deleteOne({ _id: ObjectId(id) });
        res.send(result);
     
});
   //create user
   app.put('/user/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body
    const filter = { email: email }
    const options = { upsert: true }
    const updateDoc = {
        $set: user,
    };
    const result = await usersCollection.updateOne(filter, updateDoc, options)
  const getToken = jwt.sign({email:email},process.env.ACCESS_JWT_TOKEN,{expiresIn:'1h'})
    res.send({result,getToken})
})
 

      
    }
    finally {

    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('todo is connected!')

})

//check 
app.listen(port, () => {
    console.log(`server is running ${port}`)
})