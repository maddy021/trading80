import mongoose from "mongoose";

const TurnAroundSchema=new mongoose.Schema({
   Company:String,
   CMP:Number,
   MarketCap:String,
   Sector:String,
   Date_of_Entry:String,
   Entry_Price:Number,
   Duration:String,
   Return_In_Percentage:Number,
   BSE500_Return_In_Percentage:Number
})

const TurnAround=mongoose.model("TurnAround",TurnAroundSchema);
export {TurnAround};