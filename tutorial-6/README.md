What types of proxies does the Apify Proxy include? What are the main differences between them?
Apify Proxy provides access to both residential and datacenter IP addresses. Datacenter IPs are fast and cheap, but might be blocked by target websites. Residential IPs are more expensive and harder to block.

Which proxies (proxy groups) can users access with the Apify Proxy trial? How long does this trial last?
The free trial gives access to a pool of IP addresses normally only available for the paid Freelancer subscription plan. Free trial of Apify Proxy last for 30 days.

How can you prevent a problem that one of the hardcoded proxy groups that a user is using stops working (a problem with a provider)? What should be the best practices?
It is necessary to control the frequency of requests, change addresses quite often within a session, control traffic, and so on. This is a whole complex of things. In each case, it may differ.

Does it make sense to rotate proxies when you are logged in?
It is best to keep the same proxy.

Construct a proxy URL that will select proxies only from the US (without specific groups).
http://country-US:1234567890@proxy.apify.com:8000

What do you need to do to rotate proxies (one proxy usually has one IP)? How does this differ for Cheerio Scraper and Puppeteer Scraper?
To rotate proxy servers in Apify actor or task - pass the proxyConfiguration either to the input or the Crawler class setup. With PuppeteerCrawler you have to restart the browser to change the proxy the browser is using.

Try to set up the Apify Proxy (using any group or auto) in your browser. This is useful for testing how websites behave with proxies from specific countries (although most are from the US). You can try Switchy Omega extension but there are many more. Were you successful?
Yes, I tested this on Amazon.

Name a few different ways a website can prevent you from scraping it.
Too many requests, inhuman behavior, different addresses with the same data...

Do you know any software companies that develop anti-scraping solutions? Have you ever encountered them on a website?
Nope.
