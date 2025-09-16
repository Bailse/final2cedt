// import mongoose from "mongoose";

// const AnswerSchema = new mongoose.Schema({
//   text: String,
//   points: Number,
// }, { _id: false });

// const QA = new mongoose.Schema({
//   question: String,
//   answers: [AnswerSchema],
// }, { _id: false });

// const ResultSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   imageUrl: String,
//   condition_x: { op: String, val: Number },
//   condition_y: { op: String, val: Number },
// }, { _id: false });

// const ItemSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   questions: {
//     emotion: [QA],
//     appearance: [QA],
//   },
//   results: [ResultSchema],
// }, { timestamps: true });

// const Item = mongoose.model("Item", ItemSchema);
// export default Item;


import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  points: { type: Number, required: true },
});

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answers: { type: [AnswerSchema], required: true },
});

const ConditionSchema = new mongoose.Schema({
  op: { type: String, enum: ["<=", ">"], required: true },
  val: { type: Number, required: true },
});

const ResultSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  condition_x: { type: ConditionSchema, required: true },
  condition_y: { type: ConditionSchema, required: true },
});

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    questions: {
      emotion: { type: [QuestionSchema], default: [] },
      appearance: { type: [QuestionSchema], default: [] },
    },
    results: { type: [ResultSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

// IMPORTANT: 3rd arg forces collection name to exactly "items"
const Item = mongoose.model("Item", itemSchema, "items");
export default Item;
