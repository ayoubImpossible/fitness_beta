const {db}=require('../Firebase/firebaseAdmin')
const playlisteRef=db.collection('playliste')


// Add Playliste
const addPlayListe = async (playlisteData) => {
    const playlisteDoc = await playlisteRef.add(playlisteData);
    return { id: playlisteDoc.id, ...playlisteDoc };
};
// Delete a Playliste
const deletePlayliste=async(playlisteId)=>{
    await playlisteRef.doc(playlisteId).delete();
}
// Get Playliste by ID
const getPlaylisteById = async (playlisteId) => {
    const PlaylisteDoc = await playlisteRef.doc(playlisteId).get();
    if (!PlaylisteDoc.exists) throw new Error('PlaylisteDoc not found');
    return { id: PlaylisteDoc.id, ...PlaylisteDoc.data() };
  };
//Update Playliste
const updatePlayliste=async(playlisteId,updatedData)=>{
    const playlisteRefDoc = db.collection('playliste')
    .doc(playlisteId)
await playlisteRefDoc.update(updatedData); }
// Get all playlistes
const getAllPlayListes = async () => {
    const snapshot = await playlisteRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  module.exports={
    addPlayListe,
    deletePlayliste,
    getPlaylisteById,
    updatePlayliste,
    getAllPlayListes
    }
