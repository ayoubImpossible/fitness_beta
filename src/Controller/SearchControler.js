const { searchVideosByName } =require( "../models/SearchModel");

const searchVideosHandler = async (req, res) => {
    try {
        const { name} = req.params;
  
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Missing or empty search parameter: name' });
      }
  
      const videos = await searchVideosByName(name.trim());
      return res.status(200).json(videos);
    } catch (error) {
      console.error('Controller Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

  module.exports = { searchVideosHandler };
