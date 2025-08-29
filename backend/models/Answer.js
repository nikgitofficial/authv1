import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, 
    userName: { type: String, default: "Anonymous" }, // <-- added name

    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: false },
    set: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionSet", required: false },

    answer: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Answer", AnswerSchema);
