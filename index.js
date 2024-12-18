require('dotenv').config();
const express=require ('express')
const cors=require ('cors')
const movies = require('./movies.json')
const app=express()
const port=process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8q3cu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    const movieCollection = client.db('movieDB').collection('movies');
    const favoriteCollection = client.db('movieDB').collection('favorites');
    
    
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

//get all added movie in db
  app.post('/movies',async(req,res)=>{
    const newMovie=req.body
    console.log(newMovie);
    const result=await movieCollection.insertOne(newMovie)
    res.send(result)
  })

  //read/get data/port 5000 e data show
  // app.get('/movies',async(req,res)=>{
  //   const {searchParams}=req.query
  //   let option={}
  //   if(searchParams){
  //     option={MovieTitle: {$regex: searchParams, $options: "i"}}
  //   }

  //   //const cursor= movieCollection.find(option)
  //   const result= await movieCollection.find(option).toArray()
  //   res.send(result)
  // })
  app.get('/movies', async (req, res) => {
    const { searchParams } = req.query;
    console.log("Search parameter received:", searchParams); // Debugging
    let option = {};

    if (searchParams && searchParams.trim() !== "") {
        option = { MovieTitle: { $regex: searchParams, $options: "i" } };
    }

    try {
        const result = await movieCollection.find(option).toArray();
        console.log("Filtered Results:", result); // Debugging
        res.send(result);
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).send({ error: "Failed to fetch movies" });
    }
});

  
  
  //new top rated route to show in home
  app.get('/movies/topRated', async (req, res) => {
    const cursor = movieCollection.aggregate([
        {
            $addFields: {
                Rating: {$toDouble:"$Rating"} 
          } 
        },
        {
            $sort:{Rating: -1}  
        },
        {
            $limit:6  
        }
    ]);

    const result = await cursor.toArray();
    res.send(result);
});


//update movie
app.put('/movies/:id', async (req, res) => {
const id = req.params.id;
const filter = { _id: new ObjectId(id) };
const options = { upsert: true };
const updatedDoc = {
    $set: req.body
}

const result = await movieCollection.updateOne(filter, updatedDoc, options )

res.send(result);
})



//go to specific movie 
  app.get('/movies/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await movieCollection.findOne(query);
    res.send(result);
})



//delete movie
 app.delete('/movies/:id',async (req,res)=>{
  const id=req.params.id
  const query= {_id:new ObjectId(id)}
  const result=await movieCollection.deleteOne(query)
  res.send(result);
})


    
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
    
  }
  
}
run().catch(console.dir);


app.get('/',(req,res)=>{
  res.send('SS Movie server is running')
})


app.listen(port,()=>{
    console.log(`SS Movie server is running on port:${port}`);
    
})