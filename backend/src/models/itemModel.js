import mongoose from "mongoose";
import { title } from "process";

const AnswerSchema = new mongoose.Schema({
  Descript: String,
  scoreX: Number,
  scoreY: Number
});

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  question: [{
    IsEmotional: {
      type: Boolean,
      required: true
    },
    AnswerList:[AnswerSchema]
  }],
  result:[{
      title:String,
      condition_x: {
        "op": String,
        "val": Number
      },
      condition_y: {
        "op": String,
        "val": Number
      },
      _imgURL: String,
      _description: String
  }]
  });

const Item = mongoose.model("Item", itemSchema);

export default Item;
