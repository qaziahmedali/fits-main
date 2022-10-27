import { Video } from "../models";
import { HTTP_STATUS } from "../utils/constants";
import { successResponse } from "../utils/response";
import videoSchema from "../validators/videoSchema";
const videoController = {
  // create profile
  async store(req, res, next) {
    console.log("video", req.body);
    // validation
    const { error } = videoSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { topic, video_links, video_category, video_details, price } =
      req.body;
    let document,
      success,
      message = "",
      statusCode,
      video;

    try {
      video = await Video.create({
        topic,
        video_links,
        video_category,
        video_details,
        price,
        user: req.user._id,
      });
      if (video) {
        (message = "created successfully"),
          (statusCode = 201),
          (success = true);
      } else {
        message = "not create";
        success = false;
        statusCode = 404;
      }
      document = {
        statusCode,
        success,
        message,
        data: video,
      };
      res.status(statusCode).json(document);
    } catch (err) {
      return next(err);
    }
  },
  async index(req, res, next) {
    try {
      const booking = await Video.aggregate([
        {
          $lookup: {
            from: "users",
            as: "trainer",
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
              { $unwind: "$personal" },
            ],
          },
        },
        {
          $lookup: {
            from: "reviews",
            as: "reviews",
            let: { videoId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$video", "$$videoId"] },
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
                    { $unwind: "$personal" },
                  ],
                },
              },
              { $unwind: "$user" },
            ],
          },
        },

        { $unwind: "$trainer" },
      ]).exec();

      return successResponse(
        res,
        next,
        booking,
        HTTP_STATUS.OK,
        "get videos successfully"
      );
    } catch (err) {
      return next(err);
    }
  },
};

export default videoController;
