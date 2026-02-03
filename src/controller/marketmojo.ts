import { saveToDB } from "../utils/marketMojo.js";
import scraper from "../utils/scrapper.js";
import type {Response,Request} from "express"
export const marketMojo = {
   login:async(req:Request,res:Response)=>{
        try {
        await scraper.initialize();
        await scraper.login();
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', details: (error as Error).message });
    }
   },
   getTurnarounds:async(req:Request,res:Response)=>{
       try {
          const url="https://www.marketsmojo.com/mojopro/hidden-turnarounds?cid=34/#mojoone-section-table"
          const filename=`hidden_turnaround_${Date.now()}.png`
          const response=await saveToDB({url,filename});
          if(response.success){
            return res.status(200).json(response.message);
          }
          return res.status(400).json(response.error);
       } catch (error) {
          console.log("Error in getting the turnarounds",(error as Error).message)
       }
   }    
};
