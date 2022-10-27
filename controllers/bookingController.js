import { Personal, Profession, Booking, Review } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { errorResponse, successResponse } from "../utils/response";
import bookingSchema from "../validators/bookingSchema";

const bookingController = {
  // get  All classes/or bookings
  async index(req, res, next) {},

  // book a session
  async store(req, res, next) {
    // validation
    const { error } = bookingSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    let document,
      success,
      message = "",
      statusCode,
      booking;
    const { trainerId, sessionId } = req.body;
    try {
      booking = await Booking.create({
        trainer: trainerId,
        trainee: req.user._id,
        session: sessionId,
      });
      if (booking) {
        (message = "session booked"), (statusCode = 201), (success = true);
      } else {
        message = "not booked";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: booking,
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },

  async update(req, res, next) {},

  async show(req, res, next) {},

  // get trainer booked sessions
  async getByTrainerId(req, res, next) {
    try {
      ////////////////////////////////////////////////////////////////
      const booking = await Booking.aggregate([
        {
          $lookup: {
            from: "users",
            as: "trainee",
            localField: "trainee",
            foreignField: "_id",
          },
        },
        {
          $lookup: {
            from: "sessions",
            as: "session",
            let: { sessionId: "$session" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$sessionId"] },
                },
              },
              {
                $lookup: {
                  from: "reviews",
                  as: "reviews",
                  let: { sessionId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$session", "$$sessionId"] },
                      },
                    },
                    {
                      $lookup: {
                        from: "users",
                        as: "user",
                        let: { user_id: "$user" },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $and: [{ $eq: ["$_id", "$$user_id"] }],
                              },
                            },
                          },
                          {
                            $lookup: {
                              from: "personals",
                              as: "personal",
                              localField: "personal",
                              foreignField: "_id",
                            },
                          },
                        ],
                      },
                    },
                    { $unwind: "$user" },
                  ],
                },
              },
            ],
          },
        },
        { $unwind: "$trainer" },
        { $unwind: "$trainee" },
        { $unwind: "$session" },
      ]).exec();

      if (booking.length == 0) {
        return errorResponse(res, HTTP_STATUS.NOT_FOUND, "No Bookings Found!");
      }

      return successResponse(
        res,
        next,
        booking,
        HTTP_STATUS.OK,
        "get bookings successfully"
      );
    } catch (err) {
      return next(err);
    }
  },

  // get trainee booked sessions
  async getByTraineeId(req, res, next) {
    let document,
      personal_info,
      profession_info,
      success,
      message = "",
      statusCode,
      booking;

    try {
      booking = await Booking.find({ trainee: req.params.id })
        .populate({
          path: "trainer",
          model: "User",
          select: "email numReviews averageRating role",
        })
        .populate({
          path: "session",
          model: "Session",
          populate: {
            path: "user",
            model: "User",
            select: "email numReviews averageRating role",
          },
        })
        .select("-updatedAt -__v");
      if (booking) {
        personal_info = await Personal.findOne({ user: req.params.id }).select(
          "-updatedAt -__v"
        );
        profession_info = await Profession.findOne({
          user: req.params.id,
        }).select("-updatedAt -__v");

        message = "get bookings successfully";
        statusCode = 200;
        success = true;
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: {
          booking,
          personal_info,
          profession_info,
        },
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },

  // delete trainee booked session
  async destroyTrainee(req, res, next) {
    let document, statusCode;

    try {
      document = await Booking.findByIdAndDelete({ _id: req.params.id });

      if (!document) {
        return res.status(HTTP_STATUS.NOT_ACCEPTABLE).json({
          statusCode: HTTP_STATUS.NOT_ACCEPTABLE,
          message: "There Is No Session Exists!",
          deleted: false,
        });
      }
      statusCode = HTTP_STATUS.OK;
      document = {
        statusCode,
        deleted: true,
        message: "Booking Deleted Successfully!",
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },

  // delete trainer booked session
  async destroyTrainer(req, res, next) {
    let document, statusCode;

    try {
      document = await Booking.findByIdAndDelete({ _id: req.params.id });

      if (!document) {
        return res.status(HTTP_STATUS.NOT_ACCEPTABLE).json({
          statusCode: HTTP_STATUS.NOT_ACCEPTABLE,
          message: "There Is No Session Exists!",
          deleted: false,
        });
      }
      statusCode = HTTP_STATUS.OK;
      document = {
        statusCode,
        deleted: true,
        message: "Booking Deleted Successfully!",
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
};

export default bookingController;

// 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;
// https://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@github.com/zahid258/latest_iacu_extension.git
