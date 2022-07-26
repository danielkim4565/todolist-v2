//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-dan:dddddddddd@cluster0.hekrg.mongodb.net/todolistDB");

const itemSchema = mongoose.Schema({
  name: {type: String, require: true}
});

const listSchema = mongoose.Schema({
  name: {type: String, require: true},
  items: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({name:"Welcome to your list"});
const item2 = new Item({name:"Press the + to add a new item"});
const defaultItems = [item1, item2];




app.get("/", function(req, res) {

  Item.find({_v: 0}, function(err, items){
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log("error has occured");
        } else {
          console.log("success");
        }
      });
    }
    if(err) {
      console.log("error has occured");
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});
  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    console.log("made it here");
    List.findOne({name: listName}, function(err, foundList) {
      if (foundList) {
        console.log("found it");
      }
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
  })}
});

app.post("/delete", function(req, res) {
  const articleId = mongoose.Types.ObjectId(req.body.checkbox);
  const listName = req.body.list;

  if (listName == "Today") {
    Item.findByIdAndDelete(articleId, function(err){
      if (err){
        console.log("ther is an error");
      } else {
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: articleId}}}, function(err, result){
      if (!err) {
        res.redirect("/" + listName)
      }
    })
    
  }

})

app.get("/:title", function(req,res){
  const customListName = _.capitalize(req.params.title);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (foundList) {
        console.log("found one")
        res.render("list", {listTitle: customListName, newListItems: foundList.items})
      } else {
        console.log("new list")
        const defaultList = new List({name: customListName, items: defaultItems});
        defaultList.save();
        res.redirect("/" + customListName);
      }
    } 
  })


  //res.render("list", {listTitle: req.params.title, newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// setTimeout(mongoose.connnection.close(), 50);