Where and how can you use JQuery with the SDK?
I can use Cheerio with Node.js like jQuery for manipulating the DOM of a HTML page. Mostly to select the right elements and extract their text values.

What is the main difference between Cheerio and JQuery?
jQuery runs in a browser and attaches directly to the browser's DOM. CheerioCrawler provide HTTP response to Cheerio for parsing.

When would you use CheerioCrawler and what are its limitations?
When it needs to do high workloads. CheerioCrawler can scrape 500 or more pages a minute.
Limitations. Does not work for all websites. May easily overload the target website with requests. Does not enable any manipulation of the website before scraping

What are the main classes for managing requests and when and why would you use one instead of another?
This is a RequestList and RequestQueue.
RequestList is a static, immutable list of URLs and other metadata, a perfect tool for scraping a pre-existing list of URLs.
RequestQueue on the other hand, represents a dynamic queue of Requests. One that can be updated at runtime by adding more pages - Requests to process. This allows the crawler to open one page, extract interesting URLs, such as links to other pages on the same domain, add them to the queue and repeat this process to build a queue of URLs while knowing only a single one at the beginning.

How can you extract data from a page in Puppeteer without using JQuery?
By using plain JS functions like querySelector.

What is the default concurrency/parallelism the SDK uses?
By default, the max amount of memory to be used is set to one quarter of total system memory.
