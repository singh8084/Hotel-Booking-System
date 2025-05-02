const  express = require('express')
const mongoose =require('mongoose')
const methodOverride = require('method-override')
const { title } = require('process');
const listing = require("./models/listing.js");
const ejsMate=require('ejs-mate');
const path=require('path');
const wrapAsync=require('./utils/wrapAsync.js');
const ExpressError=require('./utils/ExpressErr.js');
const {listingSchema}=require('./schema.js');

const app = express()
const port = 8080;
main().then(res=>{
    console.log("connection is successful");
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.set("views engine", "ejs")
app.use(methodOverride('_method'));
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))





const validateListing=(req, res, next)=>{
    let {error}=listingSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        throw new ExpressError(404, error)
    }else{
        next();
    }
}

// app.use((err,req, res,next)=>{
//     next();
// })


// all listings
app.get("/listings", async(req,res)=>{
    let data = await listing.find();
     
    res.render("listing/index.ejs", {data});
})
//create route

app.get("/listings/new" , (req,res)=>{
    res.render("listing/new.ejs"); 

})

// update listings

app.post("/listings", async(req,res)=>{

    const newListing =new listing(req.body.listing)

    await newListing.save();
    res.redirect("/listings")

})
 

// show route

app.get("/listings/:id",  async(req,res)=>{
    const {id}=req.params;
    const data= await listing.findById(id);
    res.render("listing/show.ejs",{data});
})

app.get("/listings/:id/edit" ,  async(req,res)=>{
    let {id}=req.params;
    let data=await listing.findById(id);
    
    res.render("listing/edit.ejs" ,{data});
})

app.put("/listings/:id", async(req,res)=>{
    const {id}=req.params;
    let {title, description,price, location, country}=req.body;
    let update= await listing.findByIdAndUpdate(id, {
        title:title,
        description:description,
        price:price,
        location:location,
        country:country,
    })
    console.log(update);
    res.redirect(`/listings/${id}`);
})


app.delete("/listings/:id",  async(req, res)=>{
    let {id}=req.params;
    let deletItem= await listing.findByIdAndDelete(id);
    console.log(deletItem);
    res.redirect("/listings");

});

// app.all("*", (req, res, next)=>{
//     next(new ExpressError(404, "page not found"));
// })

// app.use((err, req, res, next)=>{
//     let {status=500, message="someting went wrong"}=err;
//    res.status(status).render("error.ejs" , {message});
 
// })




app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))



