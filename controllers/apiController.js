const apiController = {
  // Welcome to fits
  async api(req, res, next) {
    try {
      return res.json({
        message: "Welcome To Fits Backend API",
      });
    } catch (error) {
      console.log("Default Api error : " + error);
      return next(error);
    }
  },
};

export default apiController;
