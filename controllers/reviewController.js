import { Review } from "../models";
import updateReview from "../helper/reviewUpdate";
import CustomErrorHandler from "../services/CustomErrorHandler";
import { errorResponse, successResponse } from "../utils/response";
import { HTTP_STATUS } from "../utils/constants";
const ratingController = {
  // create profile
  async store(req, res, next) {
    const { reviews, trainerId, reviewFor, videoId, sessionId } = req.body;
    let reviewData, documentSave, update;

    const saveReview = {
      rating: reviews.rating,
      comment: reviews.comment,
      user: reviews.user,
      reviewFor,
      alreadyReview: false,
    };

    try {
      if (reviewFor === "trainer") {
        if (!trainerId) {
          return errorResponse(
            res,
            HTTP_STATUS.NOT_ACCEPTABLE,
            "trainerId Is Missing!"
          );
        }
        saveReview.trainer = trainerId;
      } else if (reviewFor === "video") {
        if (!videoId) {
          return errorResponse(
            res,
            HTTP_STATUS.NOT_ACCEPTABLE,
            "videoId Is Missing!"
          );
        }
        saveReview.video = videoId;
      } else if (reviewFor === "session") {
        if (!sessionId) {
          return errorResponse(
            res,
            HTTP_STATUS.NOT_ACCEPTABLE,
            "sessionId Is Missing!"
          );
        }
        saveReview.session = sessionId;
      }

      reviewData = new Review(saveReview);

      if (reviewData.alreadyReview) {
        console.log("alreadyExist");
        return next(CustomErrorHandler.alreadyExist("alreadyExist"));
      } else {
        documentSave = await reviewData.save();

        update = await updateReview(next, {
          trainerId,
          videoId,
          sessionId,
          reviewFor,
        });

        console.log("update....", update);
      }
      return successResponse(
        res,
        next,
        documentSave,
        HTTP_STATUS.CREATED,
        "reviews submit successfully"
      );
    } catch (err) {
      return next(err);
    }
  },

  //Review Show trainer
  async show(req, res, next) {
    let document,
      success,
      message = "",
      statusCode,
      reviewing;
    try {
      reviewing = await Review.find({ trainer: req.params.id });
      if (reviewing) {
        (message = "created successfully"),
          (statusCode = 201),
          (success = true);
        console.log("reviewing", reviewing);
      } else {
        message = "not create";
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
      data: reviewing,
    };
    res.status(statusCode).json(document);
  },
};

export default ratingController;
