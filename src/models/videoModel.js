const { db } = require("../Firebase/firebaseAdmin");

const getFilteredVideos = async (muscle, level) => {
  try {
    const typesSnapshot = await db.collection('types').get();
    let allVideos = [];

    for (const typeDoc of typesSnapshot.docs) {
      const categoriesSnapshot = await typeDoc.ref.collection('categories').get();

      for (const categoryDoc of categoriesSnapshot.docs) {
        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();

        for (const exerciseDoc of exercisesSnapshot.docs) {
          const atackDocs = await exerciseDoc.ref.collection('atack').listDocuments();

          for (const atackDoc of atackDocs) {
            const levelDocs = await atackDoc.collection('levels').listDocuments();

            for (const levelDoc of levelDocs) {
              let query = levelDoc.collection('videos');

              if (muscle) {
                query = query.where('category', '==', muscle);
              }
              if (level) {
                query = query.where('difficulty', '==', level);
              }

              const videosSnapshot = await query.get();

              if (!videosSnapshot.empty) {
                const videos = videosSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                }));

                allVideos = allVideos.concat(videos);
              }
            }
          }
        }
      }
    }

    return allVideos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

module.exports = { getFilteredVideos };
