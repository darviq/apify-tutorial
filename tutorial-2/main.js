const Apify = require("apify");
const tools = require("./tools");

Apify.main(async () => {
    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ["BUYPROXIES94952"],
    });
    const { keyword } = await Apify.getInput();
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${keyword}`,
        userData: {
            label: "SEARCH_PAGE_HANDLER",
            keyword: keyword,
        },
    });
    const router = tools.createRouter({ requestQueue });
    const statistics = (await Apify.getValue("statistics")) || {};

    const handlePageFunction = async (context) => {
        const { request, page, session } = context;
        const { label } = request.userData;
        if (label !== "OFFERS_PAGE_HANDLER") {
            try {
                const pageTitle = await page.title();
                if (
                    pageTitle === "Amazon.com" ||
                    pageTitle === "Sorry! Something went wrong!"
                ) {
                    console.log("BLOCKED, MAKING session.retire()\n");
                    session.retire();
                }
            } catch (err) {
                console.log("SESSION ERROR MESSAGE: ", err.message, "\n");
                throw err;
            }
        }
        await router(label, context, statistics);
    };

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        useSessionPool: true,
        persistCookiesPerSession: true,
        sessionPoolOptions: {
            maxPoolSize: 100,
            sessionOptions: {
                maxUsageCount: 5,
            },
        },
        handlePageTimeoutSecs: 10000,
        maxConcurrency: 3,
        launchContext: {
            useChrome: true,
            launchOptions: {
                headless: false,
            },
        },
        handlePageFunction,
    });

    Apify.events.on("migrating", () => {
        Apify.setValue("statistics", statistics);
    });

    const statisticsInterval = setInterval(async () => {
        console.log(statistics);
        if (await requestQueue.isFinished()) {
            clearInterval(statisticsInterval);
        }
    }, 20000);

    await crawler.run();
});
