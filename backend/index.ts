import express from 'express';
import axios from 'axios';
import { parseString } from 'xml2js';
import dotenv from 'dotenv';
import http from 'http';
import cache from 'memory-cache';
import cors from 'cors'

dotenv.config();

var corsOptions = {
  origin: ['http://127.0.0.1', 'https://sitemap-extractor.netlify.app/'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
app.use(cors(corsOptions))
const port = process.env.PORT || 3000;
const cacheDuration = 60 * 60 * 1 * 1000; // 1 hour in milliseconds

const agent = new http.Agent({ keepAlive: true });
axios.defaults.httpAgent = agent;

// Helper function to generate a unique cache key
const generateCacheKey = (url: string) => `sitemap:${url}`;

// Helper function to periodically clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now();
  cache.keys().forEach((key) => {
    const cachedData = cache.get(key);
    if (cachedData && cachedData.expires < now) {
      cache.del(key);
    }
  });
};

// Clear expired cache entries every hour
setInterval(clearExpiredCache, 60 * 60 * 1000);

app.get('/api/sitemap', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    res.status(400).send('Missing sitemap URL');
    return;
  }

  const cacheKey = generateCacheKey(url as string);
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    res.json(cachedData);
    return;
  }

  
  try {
    // Fetch the sitemap XML
    const { data: xmlData } = await axios.get(url as string);
    
    // Parse the XML data
    parseString(xmlData, async (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        res.status(500).send('Error parsing sitemap XML');
        return;
      }
      
      const links = result.urlset.url.map((item: any) => item.loc[0].trim());
      
      // Fetch titles of webpages
      const fetchTitle = async (link: string) => {
          try {
          const { data: htmlData } = await axios.get(link);
          const titleMatch = /<title>(.*?)<\/title>/i.exec(htmlData);
          const title = titleMatch ? titleMatch[1] : 'No title found';
          return title;
        } catch (error) {
          console.error('Error fetching webpage:');
          return 'Error fetching webpage';
        }
      };
      
      // Retrieve titles of webpages in parallel
      const titles = await Promise.all(links.map(fetchTitle));
      
      // Return the links and titles
      const resultData = links.map((link: string, index: number) => ({ link, title: titles[index] }));

      // Store the data in the cache with expiration time
      const expires = Date.now() + cacheDuration;
      const cacheData = { expires, data: resultData };
      cache.put(cacheKey, cacheData, cacheDuration);

      res.json(resultData);
    });
  } catch (error) {
    console.error('Error fetching sitemap XML:', error);
    res.status(500).send('Error fetching sitemap XML');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
