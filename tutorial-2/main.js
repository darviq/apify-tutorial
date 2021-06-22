const Apify = require("apify");
const tools = require("./tools");
const { SEARCH_PAGE_LABEL, OFFERS_PAGE_LABEL } = require("./constants.json");

Apify.main(async () => {
    const STATISTICS_KEY = "statistics";
    const STATISTICS_SHOW_INTERVAL = 20000;

    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ["BUYPROXIES94952"],
    });
    const { keyword } = await Apify.getInput();
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${keyword}`,
        userData: {
            label: SEARCH_PAGE_LABEL,
            keyword: keyword,
        },
    });

    const router = tools.createRouter({ requestQueue });
    const statistics = (await Apify.getValue(STATISTICS_KEY)) || {};

    const handlePageFunction = async (context) => {
        const {
            request: {
                userData: { label },
            },
            page,
            session,
        } = context;
        if (label !== OFFERS_PAGE_LABEL) {
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
        handlePageTimeoutSecs: 30,
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
        Apify.setValue(STATISTICS_KEY, statistics);
    });

    const statisticsInterval = setInterval(async () => {
        console.log(statistics);
        if (await requestQueue.isFinished()) {
            clearInterval(statisticsInterval);
        }
    }, STATISTICS_SHOW_INTERVAL);

    await crawler.run();
});
