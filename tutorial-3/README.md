How do you allocate more CPU for your actor run?
The share of CPU is computed automatically from the memory as follows: for each 4096 MB of memory, the actor gets 1 full CPU core.

How can you get the exact time when the actor was started from within the running actor process?
By using environmen variable APIFY_STARTED_AT.

Which are the default storages an actor run is allocated (connected to)?
The default storages which are actor connected to is key-value store, dataset and request queue.

Can you change the memory allocated to a running actor?
No. You can specify the amount of memory allocated for the actor in advance in the actor itself or invoking it.

How can you run an actor with Puppeteer in a headful (non-headless) mode?
Using launchContext options - headless: false or using Node.js 12 + Chrome + Xvfb on Debian docker image, which support non-headless browsing (opens non-headless Chrome by default).

Imagine the server/instance the container is running on has a 32 GB, 8-core CPU. What would be the most performant (speed/cost) memory allocation for CheerioCrawler? (Hint: NodeJS processes cannot use user-created threads)
Giving a simple Cheerio-based crawler 32GB of memory (8 CPU cores) will not make it faster because these crawler simply cannot use more than 1 CPU core. The most performant memory allocation would be 4096 MB.
