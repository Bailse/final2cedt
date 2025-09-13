import Item from "../models/itemModel.js";

export const createItem = async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();

    res.status(200).json({ message: "OK" });
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: "Bad Request" });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
};




export const getItems = async (req, res) => {
  const items = await Item.find();

  res.status(200).json(items);
};




export const deleteItem = async (req, res) => {
  try {

    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "OK" });

  }catch (err){
    res.status(501).json({ error: "delete Not Implemented" });
  }

  
};




export const loadItems = async (req, res) => {

  try{

    const items = await Item.findById(req.params.id);

    res.status(200).json(items);
}

  catch (err){
    res.status(501).json({ error: "load Not Implemented" });
  }

};




export const updateItem = async (req, res) => {

  try{
    const items = await Item.findByIdAndUpdate(req.params.id,req.body,{ new: true });
    res.status(200).json(items);
}

  catch (err){
    res.status(501).json({ error: "update Not Implemented" });
  }

};