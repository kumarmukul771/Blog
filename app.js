var express          =require("express");
var mongoose         =require("mongoose");
var bodyParser       =require("body-parser");
var expressSanitizer =require("express-sanitizer");
var request          =require("request");
var methodOverride   =require("method-override");
var app              =express();

// initialize appS
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// connect mongodb
mongoose.connect("mongodb://localhost:27017/blog_app",{useNewUrlParser:true,useUnifiedTopology:true});

// Build Schema
var blogSchema =new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date,default:Date.now}
});

// Create model
var Blog=mongoose.model("blog",blogSchema);

// Landing Page
app.get("/",function(req,res){
    res.redirect("/blogs");
});

// Index Page(index route)
app.get("/blogs",function(req,res){
    Blog.find({},function(err,allBlogs){
        if(err) console.log("An error occured!");
        else res.render("index",{allBlogs:allBlogs});
    });
});

// Collects info from New route from  and add to db (Create route)
app.post("/blogs",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function(err,newBlog){
        if(err) console.log("An error occured");
        else 
        {
            console.log("Inserted");
            res.redirect("/");
        }
    });
});

// Form to create new blog(new route)
app.get("/blogs/new",function(req,res){
    res.render("create");
});

// Show more details about each blog(Show route)
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err) console.log("an error occured");
        else res.render("show",{blog:foundBlog});
    });
});

// Edit (from) blog(Edit route)
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err) console.log("an error occured");
        else res.render("edit",{editBlog:foundBlog});
    });
});

// Update route
app.put("/blogs/:id",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err) console.log("Error in updation");
        else    res.redirect("/blogs/"+req.params.id);
    });
});

// Destroy route
app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err) console.log("error in deletion");
        else res.redirect("/");
    })
})

// start app
app.listen(3000,process.env.IP,function(){
    console.log("Server is listening!");
})