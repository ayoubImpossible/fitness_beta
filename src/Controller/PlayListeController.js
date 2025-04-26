//modifier une playlist
const { addPlayListe, deletePlayliste } = require("../models/playlisteModel");

//add  playlist controller
const AddPlayListeHandler=async(req,res)=>{
    const {namePlayliste,typePlayListe}=req.params;
    try{
        const playlisteData = {
            namePlayliste,
            typePlayListe          }
          const newPlayliste = await addPlayListe(playlisteData);
          res.status(201).json(newPlayliste);
    
    }catch(error){
        res.status(500).json({ error: error.message });
    
    }}
//delete une playlist
const DeletePlaylisteHandler=async(req,res)=>{
    const { playlisteId } = req.params;
    try{
        await deletePlayliste(playlisteId);
        res.status(200).json({ message: "type et image supprimés avec succès." });
    }catch(error){
        res.status(500).json({ message: "Erreur serveur lors de la suppression de playlist " });
    
    }}
//Update playliste
const UpdatePlaylisteHandler=async(req,res)=>{
    try{

    }catch(error){

    
    
    }}
//getAll playlistes
const GetAllPlaylistesHandler=async(req,res)=>{
    try{

    }catch(error){


    }}
//Search for an playliste
const SearchPlaylisteHandler=async(req,res)=>{
    try{

    }catch(error){

  
    }}

module.exports={
    AddPlayListeHandler,
    DeletePlaylisteHandler,
    UpdatePlaylisteHandler,
    GetAllPlaylistesHandler,
    SearchPlaylisteHandler
    }