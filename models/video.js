const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const videoSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: { type: String },
    video_links: {
      type: Array,
    },
    video_category: {
      type: String,
    },
    video_details: {
      type: String,
    },
    price: {
      type: Number,
    },
    numReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema, "videos");
