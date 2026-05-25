import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.config.js";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Force Google DNS


const app = express();
dotenv.config()

const PORT = process.env.PORT || 8000 ;

app.listen(PORT, () =>{
    console.log(`Server started at port ${PORT}`);
    connectDB();
    
})