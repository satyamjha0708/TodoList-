const express=require("express");
const bodyParser=require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app=express();

app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser:true});


const itemSchema ={
    item:String
};


const Item =mongoose.model("Item",itemSchema);


const item1= new Item({
    item:"Eating Food"
});


const item2= new Item({
    item:"Take Bath"
});


const item3= new Item({
    item:"Meeting Hari"
});




const defaultitem=[item1,item2,item3];



const listSchema={
    name:String,
    it:[itemSchema]
};


const List= mongoose.model("List",listSchema);








app.use(express.static("public"))
app.get("/",function(req,res){



    Item.find({},function(err,foundItems){

        if(foundItems.length ==0){
            Item.insertMany(defaultitem,function(err){
                if(err){
                    console.log(err);
                }
            
                else{
                    console.log("Sucess");
                }
            })


            res.redirect("/");
        }

        else{

        res.render("list",{kindofDay:"Today", newListItem:foundItems});
        console.log(foundItems);
        }

    })
})


app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                
                // If new list is there 
                const list = new List({
                    name:customListName,
                    it:defaultitem
                });
                console.log(customListName);
                list.save();
                
                res.redirect("/"+ customListName);
                }
                
            
            else{
                // If Exist
                res.render("list",{kindofDay:foundList.name, newListItem:foundList.it})
            }


        }

        })
    })

    



app.post("/delete" , function(req,res){
    const listName=req.body.listname;

    

if(listName=="Today"){
    Item.findByIdAndRemove(req.body.checkbox,function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("Remove from db");
        }
    })


    res.redirect("/");
    }else{

        List.findOneAndUpdate({name:listName},{$pull:{it:{_id:req.body.checkbox}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });


    }



}
);











app.post("/",function(req,res){




    const itemname = req.body.newItem;
    const listName = req.body.b1;

    const item4 = new Item({
        item: itemname
    });

    if (listName==="Today"){

        console.log("Hiiiii111");
        item4.save();
        res.redirect("/");
    }
    else{
        

        List.findOne({name:listName},function(err,foundList){


           

            foundList.it.push(item4);
            foundList.save();
            res.redirect("/"+listName);
        })
    }



})


app.listen(3000,function(){
    console.log("server is running");
})