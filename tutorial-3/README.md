How do you allocate more CPU for your actor run?
The share of CPU is computed automatically from the memory as follows: for each 4096 MB of memory, the actor gets 1 full CPU core.

How can you get the exact time when the actor was started from within the running actor process?
Each run starts with the initial status READY and goes through one or more transitional statuses to one of the terminal statuses. So, using this statuses, we can know the exact time of everyone.

Which are the default storages an actor run is allocated (connected to)?
The actor has hard disk space limited by twice the amount of memory. For example, an actor with 1024 MB of memory will have 2048 MB of disk available.

Can you change the memory allocated to a running actor?
Before starting the actor.

How can you run an actor with Puppeteer in a headful (non-headless) mode?
Using launchContext options - headless: false.

Imagine the server/instance the container is running on has a 32 GB, 8-core CPU. What would be the most performant (speed/cost) memory allocation for CheerioCrawler? (Hint: NodeJS processes cannot use user-created threads)
Giving a simple Cheerio-based crawler 32GB of memory (8 CPU cores) will not make it faster because these crawler simply cannot use more than 1 CPU core. The most performant memory allocation would be 4096 MB.
