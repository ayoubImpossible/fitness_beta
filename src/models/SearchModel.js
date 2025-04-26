const { db } = require('../Firebase/firebaseAdmin');

const searchVideosByName = async (searchTerm) => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const matchedVideos = [];

  try {
    const typesSnapshot = await db.collection('types').get();

    await Promise.all(typesSnapshot.docs.map(async (typeDoc) => {
      const categoriesSnapshot = await typeDoc.ref.collection('categories').get();

      await Promise.all(categoriesSnapshot.docs.map(async (categoryDoc) => {
        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();

        await Promise.all(exercisesSnapshot.docs.map(async (exerciseDoc) => {
          const atackSnapshot = await exerciseDoc.ref.collection('atack').get();

          await Promise.all(atackSnapshot.docs.map(async (atackDoc) => {
            const levelsSnapshot = await atackDoc.ref.collection('levels').get();

            await Promise.all(levelsSnapshot.docs.map(async (levelDoc) => {
              const videosSnapshot = await levelDoc.ref.collection('videos').get();

              videosSnapshot.docs.forEach((videoDoc) => {
                const videoData = videoDoc.data();
                const videoName = videoData.name?.toLowerCase() || '';

                if (videoName.includes(lowerSearchTerm)) {
                  matchedVideos.push({
                    id: videoDoc.id,
                    ...videoData,
                  });
                }
              });
            }));
          }));
        }));
      }));
    }));

    if (matchedVideos.length === 0) {
      console.log("No matching videos found.");
    }

    return matchedVideos;
  } catch (error) {
    console.error('Error searching videos by name:', error);
    return [];
  }
};

module.exports = { searchVideosByName };
