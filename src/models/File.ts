import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
	{
		filename: {
			type: String,
			required: [true, "Please provide a filename"],
		},
		originalName: {
			type: String,
			required: [true, "Please provide the original filename"],
		},
		size: {
			type: Number,
			required: [true, "Please provide the file size"],
		},
		mimeType: {
			type: String,
			required: [true, "Please provide the mime type"],
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Please provide a user ID"],
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.File || mongoose.model("File", FileSchema);
