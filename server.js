const express = require('express');
const dotenv = require('dotenv');
const exerciseRoutes = require('./src/router/exerciseRoutes');
const userRoutes = require('./src/router/userRoutes');
const categorieRoutes = require('./src/router/categorieRouter');
const levelRoutes = require('./src/router/levelRouter');
const typesRoutes = require('./src/router/typesRoutes');
const atackRoutes = require('./src/router/atackMusculeRouter');
const videoByRoutes = require('./src/router/videoByRouter');
const plansRouter = require('./src/router/planRouter')
const workoutsRouter = require('./src/router/workoutRoutes')
const protectedRoutes = require('./src/router/protected');
const savedcategoryRouter = require('./src/router/savedRouter');
const profileRouter = require('./src/router/profileRouter')
const searchRouter = require('./src/router/searchRouter')
const AiRouter = require('./src/router/aiRouter')
const ProgrammeRouter = require('./src/router/ProgrammeRouter')
const likePlan = require('./src/router/likeRouter')
const tiktokRouter = require('./src/router/tiktokRouter')
const adminRouter = require('./src/router/adminRouter')
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const cors = require('cors');
const app = express();
app.use(express.json());
dotenv.config();
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());

app.disable('x-powered-by');

// ─── CDN caching for public, read-only content ───────────────────────────────
// The in-memory caches in the models don't survive Vercel serverless restarts,
// so let Vercel's edge cache serve these GETs instead. User-specific routes
// (saved, profile, plans, workouts by uid, AI, admin) are NOT listed here.
const PUBLIC_GET_CACHE = [
  // [path regex, seconds fresh at the edge]
  [/^\/api\/categorie\/(all|getCountAllVideos\/[^/]+)$/, 3600],
  [/^\/api\/types\/getTypes$/, 3600],
  [/^\/api\/Bytime\/getAll(Equipment|Duration)$/, 3600],
  [/^\/api\/atack\/getAllVideoByAtackMuscle$/, 3600],
  [/^\/api\/exercises\/type\/[^/]+\/categories\/[^/]+$/, 3600],
  // contain like counts → shorter
  [/^\/api\/programs(\/muscu-phases|\/[^/]+\/full)?$/, 300],
  [/^\/api\/Workouts\/getPrepareExerciceByPosition$/, 300],
];
app.use((req, res, next) => {
  if (req.method === 'GET' && req.query.refresh !== 'true') {
    const hit = PUBLIC_GET_CACHE.find(([re]) => re.test(req.path));
    if (hit) {
      res.set('Cache-Control', `public, max-age=0, s-maxage=${hit[1]}, stale-while-revalidate=86400`);
    }
  }
  next();
});

app.use('/api/exercises', exerciseRoutes);

app.use('/api/users', userRoutes);
app.use('/api/categorie', categorieRoutes);
app.use('/api/video', levelRoutes);
app.use('/api/types', typesRoutes);
app.use('/api/atack', atackRoutes);
app.use('/api/Bytime', videoByRoutes);
app.use('/api/Plans', plansRouter);
app.use('/api/Workouts', workoutsRouter);
app.use('/api/protected', protectedRoutes);
app.use('/api', savedcategoryRouter);
app.use('/api/like', likePlan);
app.use('/api/profile', profileRouter);
app.use('/api', searchRouter)
app.use('/api/Ai', AiRouter);
app.use('/api', ProgrammeRouter)
app.use('/api/tiktok', tiktokRouter);
app.use('/api/admin', adminRouter);




app.get('/', (req, res) => {
  res.send('Fitness App API is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});