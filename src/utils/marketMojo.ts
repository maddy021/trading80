import scraper from "./scrapper.js";
import path from "path";
import fs from "fs";

async function deleteFileIfExists(filePath: string): Promise<void> {
    try {
        await fs.promises.unlink(filePath);
        console.log(`Deleted: ${filePath}`);
    } catch (error) {
        const err = error as NodeJS.ErrnoException | undefined;
        if (err?.code === 'ENOENT') {
            console.warn(`File already deleted or not found: ${filePath}`);
        } else {
            console.error(`Error deleting file: ${filePath}`, error);
        }
    }
}
async function saveToDB({url, filename}:{url:string, filename:string}){
   try {
      const result = await scraper.scrapeWithScreenshot(url, filename);
  
      if (!result) {
        // return res.status(400).json({ success: false, message: 'Failed to scrape data' });
        return {
            success:false,
            message:"Failed to scrape data"
        }
      }
  
      const { jsonFilename,screenshotPath } = result;
      const filePath = path.join(__dirname, jsonFilename);
  
      fs.readFile(filePath, 'utf-8',async(err,data)=>{
        if(err){
            return {success:false,message:err}
        }
        if(data){
            const datas = JSON.parse(data);
            console.log("data is about to save",datas);
        
            if (!Array.isArray(datas)) {
              // return res.status(400).json({ success: false, message: 'Extracted JSON is not an array.' });
              return { success: false, message: 'Extracted JSON is not an array.' }
            }
        
            // Save/Upsert into MongoDB
            // const updatedStock = await Stock.findOneAndUpdate(
            //   { category: categoryName },
            //   { 
            //     data: datas,
            //     updatedAt: new Date()
            //   },
            //   {
            //     upsert: true,
            //     new: true,
            //     setDefaultsOnInsert: true
            //   }
            // );
      
            
          // After saving to DB, delete temporary files
            await deleteFileIfExists(filePath);     
            await deleteFileIfExists(screenshotPath); 
        }
    });
  
    //   res.json({ success: true, message: `${categoryName} scraped and saved successfully!`, stock: updatedStock });
      return({ success: true, message: `scraped and saved successfully!`, stock: "updatedStock" });  
    } catch (error) {
      console.error(error);
    //   res.status(500).json({ success: false, message: 'An error occurred.', error: error.message });
        return({ success: false, message: 'An error occurred.', error: (error as Error).message });

}
}

export {saveToDB};
