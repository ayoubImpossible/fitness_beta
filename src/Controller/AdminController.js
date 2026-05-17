const { getAllVid } = require("../models/getVideoBy");
const { db } = require("../Firebase/firebaseAdmin");

/**
 * Enhanced video library for Admin Panel
 * Fetches all videos and enriches them with parent metadata (Difficulty, Equipment)
 */
const getAdminVideosLibrary = async (req, res) => {
  try {
    const videos = await getAllVid(); 
    
    if (!videos || videos.length === 0) {
      return res.status(404).json({ message: "No videos found" }); 
    }

    // 1. Bulk fetch all potential metadata sources
    const [snap1, snap2, snap3, snap4, snap5] = await Promise.all([
      db.collectionGroup('exercises').get(),
      db.collectionGroup('exercices').get(),
      db.collectionGroup('atack').get(),
      db.collectionGroup('atacks').get(),
      db.collectionGroup('PreparerExercices').get()
    ]);

    const metadataMap = {};
    [snap1, snap2, snap3, snap4, snap5].forEach(snap => {
      snap.forEach(doc => {
        const id = doc.id;
        const data = doc.data();
        metadataMap[id] = {
          ...(metadataMap[id] || {}),
          ...data,
          _id: id,
          _path: (metadataMap[id]?._path ? `${metadataMap[id]._path}, ${doc.ref.path}` : doc.ref.path)
        };
      });
    });

    // 2. Fetch all immediate and ancestor documents
    const getAllAncestorPaths = (videoPath) => {
      const parts = videoPath.split('/');
      const ancestors = [];
      for (let i = 2; i < parts.length; i += 2) {
        ancestors.push(parts.slice(0, i).join('/'));
      }
      return ancestors;
    };

    const allAncestorPaths = [...new Set(videos.flatMap(v => getAllAncestorPaths(v.path)))].filter(Boolean);
    const parentSnaps = allAncestorPaths.length > 0 ? await db.getAll(...allAncestorPaths.map(p => db.doc(p))) : [];
    
    const ancestorDataMap = {};
    parentSnaps.forEach(snap => {
      if (snap.exists) {
        const data = snap.data();
        ancestorDataMap[snap.ref.path] = data;
      }
    });

    let diffCount = 0, equipCount = 0;

    // 3. Enrich videos using all available sources
    const enrichedVideos = videos.map((v, index) => {
      const ancestors = getAllAncestorPaths(v.path).reverse();
      const ancestorDocs = ancestors.map(path => ancestorDataMap[path] || {});
      
      const findId = (docs, idKeys) => {
        for (const doc of docs) {
          for (const key of idKeys) {
            if (doc[key]) return doc[key];
          }
        }
        return null;
      };

      const exId = findId([v, ...ancestorDocs], ['exerciceId', 'exerciseId']);
      const atId = findId([v, ...ancestorDocs], ['atackId', 'attackId']);
      const lvlId = findId([v, ...ancestorDocs], ['levelId', 'level_id']);

      const allDocs = [
        v,
        ...ancestorDocs,
        metadataMap[exId] || {},
        metadataMap[atId] || {},
        metadataMap[lvlId] || {}
      ].filter(Boolean);

      const findFieldWithSource = (docs, patterns) => {
        for (const doc of docs) {
          if (!doc) continue;
          for (const key of Object.keys(doc)) {
            const k = key.toLowerCase().trim();
            if (patterns.some(p => k === p)) {
              const val = doc[key];
              if (val && val !== "" && val !== "—") return { val, source: doc._path || 'local' };
            }
          }
        }
        return { val: null, source: null };
      };

      const nameRes = findFieldWithSource(allDocs, ['titre', 'name', 'title', 'label']);
      const diffRes = findFieldWithSource(allDocs, ['difficulty', 'level', 'difficulté', 'difficulté_id', 'lvl']);
      const equipRes = findFieldWithSource(allDocs, ['equipment', 'material', 'materiel', 'matériel', 'muscleattack', 'muscleattacker', 'type', 'equipement', 'at-home equipment', 'machine', 'materiel_id']);
      const durRes = findFieldWithSource(allDocs, ['duration', 'temps', 'temps_execution']);

      if (diffRes.val) diffCount++;
      if (equipRes.val) equipCount++;

      if (index < 2) {
        console.log(`🔍 [AdminDebug] Video: ${v.titre || v.name} [${v.id}]`);
        console.log(`🔍 [AdminDebug] Sources: diff=${diffRes.source}, equip=${equipRes.source}`);
      }

      return {
        ...v,
        name: nameRes.val || 'Untitled',
        difficulty: diffRes.val || '—',
        equipment: equipRes.val || '—',
        duration: durRes.val || 0,
        _debug_sources: { name: nameRes.source, difficulty: diffRes.source, equipment: equipRes.source }
      };
    });

    console.log(`📊 [AdminDebug] Enrichment Summary: Difficulty found for ${diffCount}/${videos.length}, Equipment for ${equipCount}/${videos.length}`);

    res.status(200).json(enrichedVideos);
  } catch (error) {
    console.error("Error in getAdminVideosLibrary:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAdminVideo = async (req, res) => {
  try {
    const { path, id } = req.query;
    if (!path) return res.status(400).json({ message: "Path is required" });
    
    const collectionPath = path.substring(0, path.lastIndexOf('/'));
    const { deleteVideo } = require("../models/getVideoBy");
    await deleteVideo(collectionPath, id);
    res.json({ success: true, message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAdminVideo = async (req, res) => {
  try {
    const { path, id, data } = req.body;
    if (!path) return res.status(400).json({ message: "Path is required" });
    
    const collectionPath = path.substring(0, path.lastIndexOf('/'));
    const { updateVideo } = require("../models/getVideoBy");
    await updateVideo(collectionPath, id, data);
    res.json({ success: true, message: "Video updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminFullTree = async (req, res) => {
  try {
    const [catsSnap, snap1, snap2, snap3, snap4, snap5, levelsSnap, videosSnap] = await Promise.all([
      db.collectionGroup('categories').get(),
      db.collectionGroup('exercises').get(),
      db.collectionGroup('exercices').get(),
      db.collectionGroup('atack').get(),
      db.collectionGroup('atacks').get(),
      db.collectionGroup('PreparerExercices').get(),
      db.collectionGroup('levels').get(),
      db.collectionGroup('videos').get()
    ]);

    const categories = catsSnap.docs.map(doc => ({ 
      id: doc.id, 
      _path: doc.ref.path,
      ...doc.data(), 
      name: doc.data().CategorieName || doc.data().name || 'Untitled Category',
      exercises: [] 
    }));
    
    const exercises = [];
    [snap1, snap2, snap3, snap4, snap5].forEach(snap => {
      snap.forEach(doc => {
        exercises.push({ id: doc.id, _path: doc.ref.path, ...doc.data(), levels: [], videos: [] });
      });
    });

    const levels = levelsSnap.docs.map(doc => ({ id: doc.id, _path: doc.ref.path, ...doc.data(), videos: [] }));
    const videos = videosSnap.docs.map(doc => ({ id: doc.id, _path: doc.ref.path, ...doc.data() }));

    const catsMap = Object.fromEntries(categories.map(c => [c._path, c]));
    const exMap = Object.fromEntries(exercises.map(e => [e._path, e]));
    const lvlMap = Object.fromEntries(levels.map(l => [l._path, l]));

    // Link videos to parents (either level or exercise)
    videos.forEach(v => {
      const parts = v._path.split('/');
      const parentPath = parts.slice(0, -2).join('/');
      if (lvlMap[parentPath]) {
        lvlMap[parentPath].videos.push(v);
      } else if (exMap[parentPath]) {
        exMap[parentPath].videos.push(v);
      }
    });

    // Link levels to exercises
    levels.forEach(lvl => {
      const parts = lvl._path.split('/');
      const parentPath = parts.slice(0, -2).join('/');
      if (exMap[parentPath]) {
        exMap[parentPath].levels.push(lvl);
      }
    });

    // Link exercises to categories
    exercises.forEach(ex => {
      const parts = ex._path.split('/');
      const parentPath = parts.slice(0, -2).join('/');
      if (catsMap[parentPath]) {
        catsMap[parentPath].exercises.push(ex);
      } else {
        // Fallback to ID-based linking for top-level or cross-linked exercises
        const catId = ex.categorieId || ex.categoryId;
        const cat = categories.find(c => c.id === catId);
        if (cat) cat.exercises.push(ex);
      }
    });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAdminVideosLibrary,
  getAdminFullTree,
  deleteAdminVideo,
  updateAdminVideo
};
