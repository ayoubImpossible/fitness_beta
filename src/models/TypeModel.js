const { db,bucket  } = require('../Firebase/firebaseAdmin');



const typesRef = db.collection('types');

// Get all categories
const getAllTypes = async () => {
  const snapshot = await typesRef.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// Add Type
const addType = async (typeData) => {
    const typeDoc = await typesRef.add(typeData);
    return { id: typeDoc.id, ...typeData };
  };
// Delete a type
const deleteType=async(id)=>{
    await typesRef.doc(id).delete();
}
// Get category by ID
const getTypeById = async (id) => {
    const TypeDoc = await typesRef.doc(id).get();
    if (!TypeDoc.exists) throw new Error('Types not found');
    return { id: TypeDoc.id, ...TypeDoc.data() };
  };

const updateType=async(typeId,updatedData)=>{
    const TypeRef = db.collection('types')
    .doc(typeId)
await TypeRef.update(updatedData);

}
const getVideosByTypeName = async (typeName) => {
  try {
    const typesSnapshot = await db.collection("types")
      .where("TypeName", "==", typeName) // ✅ Filter by type name
      .get();

    let allVideos = [];

    const typePromises = typesSnapshot.docs.map(async (typeDoc) => {
      const categoriesSnapshot = await typeDoc.ref.collection("categories").get();

      const categoryPromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
        const exercisesSnapshot = await categoryDoc.ref.collection("exercises").get();

        const exercisePromises = exercisesSnapshot.docs.map(async (exerciseDoc) => {
          const attackSnapshot = await exerciseDoc.ref.collection("atack").get();

          const attackPromises = attackSnapshot.docs.map(async (attackDoc) => {
            const levelsSnapshot = await attackDoc.ref.collection("levels").get();

            const levelPromises = levelsSnapshot.docs.map(async (levelDoc) => {
              const videoSnapshot = await levelDoc.ref.collection("videos").get();
              return videoSnapshot.docs.map((videoDoc) => ({
                id: videoDoc.id,
                ...videoDoc.data(),
              }));
            });

            // Collect all videos from levels
            const videos = await Promise.all(levelPromises);
            return videos.flat();
          });

          return (await Promise.all(attackPromises)).flat();
        });

        return (await Promise.all(exercisePromises)).flat();
      });

      return (await Promise.all(categoryPromises)).flat();
    });

    const allResults = await Promise.all(typePromises);
    allVideos = allResults.flat();

    return allVideos;
  } catch (error) {
    console.error("Error fetching videos by typeName:", error);
    return [];
  }
};

module.exports = {
    addType,deleteType,getTypeById,updateType,getAllTypes,getVideosByTypeName
};
