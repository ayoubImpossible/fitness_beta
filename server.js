const express = require('express');
const dotenv = require('dotenv');
const exerciseRoutes = require('./src/router/exerciseRoutes');
const userRoutes = require('./src/router/userRoutes');
const categorieRoutes = require('./src/router/categorieRouter');
const levelRoutes = require('./src/router/levelRouter');
const typesRoutes = require('./src/router/typesRoutes');
const atackRoutes = require('./src/router/atackMusculeRouter');
const videoByRoutes=require('./src/router/videoByRouter');
const plansRouter=require('./src/router/planRouter')
const workoutsRouter=require('./src/router/workoutRoutes')
const protectedRoutes = require('./src/router/protected');
const savedcategoryRouter = require('./src/router/savedRouter');
const profileRouter=require('./src/router/profileRouter')
const searchRouter=require('./src/router/searchRouter')


const helmet =require('helmet') ;
const bodyParser =require('body-parser') ;
const cookieParser =require( 'cookie-parser') ;

const cors = require('cors');
const verifyToken = require('./src/Utils/VerifyToken');
const app=express();


app.use(express.json());

dotenv.config();

app.use(express.urlencoded({extended:true}))

app.use(cors());

app.use(helmet());

app.use(bodyParser.json());

app.use(cookieParser());

app.disable('x-powered-by');
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);    
app.use('/api/categorie', categorieRoutes); 
app.use('/api/video', levelRoutes);
app.use('/api/types', typesRoutes); 
app.use('/api/atack', atackRoutes); 
app.use('/api/Bytime', videoByRoutes); 
app.use('/api/Plans', plansRouter); 
app.use('/api/Workouts', workoutsRouter); 
app.use('/api/protected',protectedRoutes);
app.use('/api/protected',protectedRoutes);
app.use('/api',savedcategoryRouter);
app.use('/api/profile',profileRouter);
app.use('/api',searchRouter)



// Default route
app.get('/', (req, res) => {
  res.send('Fitness App API is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});