import { Personal, User } from "../models";
import profileSchema from "../validators/profileSchema";

const personalController = {
  // create profile
  async store(req, res, next) {
    // validation
    const { error } = profileSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { name, date_of_birth, country, state, city, gender, profileImage } =
      req.body;
    let document,
      success,
      message = "",
      statusCode,
      personal;

    try {
      personal = await Personal.create({
        name,
        date_of_birth,
        country,
        state,
        city,
        gender,
        user: req.user._id,
        profileImage,
      });
      if (personal) {
        await User.findOneAndUpdate(
          { _id: req.user._id },
          {
            personal: personal._id,
          },
          { new: true }
        );
        success = true;
        statusCode = 201;
        message = "personal info create successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: personal,
    };
    res.status(statusCode).json(document);
  },
  async index(req, res, next) {
    let document,
      success,
      message = "",
      statusCode,
      personal;
    try {
      personal = await Personal.find();
      if (personal) {
        success = true;
        statusCode = 200;
        message = "get all personal info  successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: personal,
    };

    res.status(statusCode).json(document);
  },
  async show(req, res, next) {
    let document,
      success,
      message = "",
      statusCode,
      personal;
    try {
      document = await Personal.find({ user: req.params.userId });
      if (personal) {
        success = true;
        statusCode = 200;
        message = "get personal info  successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: personal,
    };

    res.status(statusCode).json(document);
  },

  //update profile info
  async update(req, res, next) {
    // validation
    const { error } = profileSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { name, date_of_birth, country, state, city, gender, profileImage } =
      req.body;
    console.log("req.body", req.body);
    let document,
      success,
      message = "",
      statusCode,
      personal;

    try {
      personal = await Personal.findOneAndUpdate(
        { _id: req.params.id },
        {
          name,
          date_of_birth,
          country,
          state,
          city,
          gender,
          user: req.user._id,
          profileImage,
        },
        { new: true }
      );
      if (personal) {
        success = true;
        statusCode = 200;
        message = "update personal info  successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: personal,
    };

    res.status(statusCode).json(document);
  },
};

export default personalController;
