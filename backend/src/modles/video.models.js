import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
  {
    videoFile: {
      typeof: String, // cloudinay url
      required: [true, "video file is required."],
    },
    thumbnil: {
      typeof: String, // cloudinay url
      required: true,
    },
    title: {
      typeof: String,
      required: true,
    },
    description: {
      typeof: String,
      required: true,
    },
    duration: {
      type: Number, // extract duration from cloudinary
      required: true,
    },
    views: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", videoSchema);
