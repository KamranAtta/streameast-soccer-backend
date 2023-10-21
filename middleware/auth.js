exports.authenticateUser = async (req, res, next) => {
    try {
      const data = req.body;
      if(data.email === process.env.AUTH_EMAIL && data.password === process.env.AUTH_PASSWORD){
        next();
        // res.status(200).json({"authenticated": true});
      }else {
        res.status(200).json({"authenticated": false});
      }
    } catch (error) {
      res.status(500).json({'status': "News Card not updated!"});
    }
  }