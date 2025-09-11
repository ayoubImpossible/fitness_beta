const { db  } = require('../Firebase/firebaseAdmin');



const typesRef = db.collection('types');

const getAllTypes = async () => {
  const snapshot = await typesRef.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
const addType = async (typeData) => {
    const typeDoc = await typesRef.add(typeData);
    return { id: typeDoc.id, ...typeData };
  };
const deleteType=async(id)=>{
    await typesRef.doc(id).delete();
}
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
//Optimisé done 🆗
const getVideosByTypeName = async (typeName) => {
  try {
    const typeSnapshot = await db.collection("types")
      .where("TypeName", "==", typeName)
      .get();

    if (typeSnapshot.empty) return [];

    const typeId = typeSnapshot.docs[0].id;

    const videosSnapshot = await db.collectionGroup("videos")
      .where("typeId", "==", typeId)
      .get();

    return videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching videos by typeName:", error);
    return [];
  }
};


module.exports = {
    addType,deleteType,getTypeById,updateType,getAllTypes,getVideosByTypeName
};
