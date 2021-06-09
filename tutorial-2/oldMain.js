const Apify = require("apify");

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

    const handlePageFunction = async ({ request, page, session }) => {
        const { url: requestUrl, userData } = request;
        const { label, asin, title, url, description, keyword } = userData;
        if (label !== "OFFERS_PAGE_HANDLER") {
            try {
                const pageTitle = await page.title();
                if (
                    pageTitle === "Amazon.com" ||
                    pageTitle === "Sorry! Something went wrong!"
                ) {
                    console.log("ПОЙМАЛ БЛОКИРОВКУ, делаю session.retire()\n");
                    session.retire();
                }
            } catch (err) {
                console.log("SESSION ERROR MESSAGE: ", err.message, "\n");
                throw err;
            }
        }

        switch (label) {
            case "SEARCH_PAGE_HANDLER":
                await page.waitForSelector(".s-asin");
                const asins = await page.$$eval(".s-asin", (products) => {
                    const data = [];
                    products.forEach((product) => {
                        !product.classList.contains("AdHolder") &&
                            data.push(product.getAttribute("data-asin"));
                    });
                    return data;
                });
                console.log(asins, "\n");

                await asins.forEach(async (oneAsin) => {
                    await requestQueue.addRequest({
                        url: `https://www.amazon.com/dp/${oneAsin}`,
                        userData: {
                            label: "PRODUCT_PAGE_HANDLER",
                            asin: oneAsin,
                            keyword: keyword,
                        },
                    });
                });
                break;

            case "PRODUCT_PAGE_HANDLER":
                await page.waitForSelector("#productTitle");
                const productTitle = await page.$eval("#productTitle", (el) =>
                    el.textContent.trim()
                );
                const descriptionParts = await page.$$eval(
                    "#productDescription p",
                    (elems) => {
                        const data = [];
                        elems.forEach((elem) => {
                            const text = elem.textContent.trim();
                            if (text.length > 0) data.push(text);
                        });
                        return data;
                    }
                );
                const productDescription = descriptionParts.reduce(
                    (finalDescription, descriptionPart) => {
                        if (descriptionPart.length > 0) {
                            finalDescription = descriptionPart + " ";
                            return finalDescription;
                        }
                    },
                    ""
                );
                console.log("Title: ", productTitle);
                console.log("URL: ", requestUrl);
                console.log(
                    "Description length: ",
                    productDescription.length,
                    "\n"
                );
                await requestQueue.addRequest({
                    url: `https://www.amazon.com/gp/offer-listing/${asin}`,
                    userData: {
                        label: "OFFERS_PAGE_HANDLER",
                        asin: asin,
                        title: productTitle,
                        url: requestUrl,
                        description: productDescription,
                        keyword: keyword,
                    },
                });
                break;

            case "OFFERS_PAGE_HANDLER":
                await page.waitForTimeout(10000);
                const loaded = await page.$("#aod-filter-offer-count-string");
                if (!loaded) throw new Error("ERROR OF OFFERS_PAGE_HANDLER");
                const offersAmountString = await page.$eval(
                    "#aod-filter-offer-count-string",
                    (amountText) => amountText.innerText
                );
                const offersRequestAmount = Math.ceil(
                    Number.parseInt(offersAmountString) / 10
                );
                if (
                    Number.isInteger(offersRequestAmount) &&
                    offersRequestAmount > 0
                ) {
                    for (let i = 1; i <= offersRequestAmount; i++) {
                        await requestQueue.addRequest(
                            {
                                url: `https://www.amazon.com/gp/aod/ajax/ref=aod_page_${i}?asin=${asin}&pc=dp&isonlyrenderofferlist=true&pageno=${i}`,
                                userData: {
                                    label: "OFFERS_LIST_HANDLER",
                                    asin: asin,
                                    title: title,
                                    url: url,
                                    description: description,
                                    keyword: keyword,
                                },
                            },
                            { forefront: true }
                        );
                    }
                }
                break;
            case "OFFERS_LIST_HANDLER":
                const offers = await page.$$eval("#aod-offer", ($offers) => {
                    const data = [];
                    $offers.forEach(($offer) => {
                        const sellerName = $offer.querySelector(
                            "#aod-offer-soldBy a"
                        ).innerText;
                        const price = $offer.querySelector(
                            "#aod-offer-price .a-price .a-offscreen"
                        ).innerText;
                        let shippingPrice = "";
                        if (
                            $offer.querySelector(
                                "#aod-offer-price .a-color-base .a-size-base"
                            ) === null
                        ) {
                            shippingPrice = "free";
                        } else {
                            shippingPrice = $offer.querySelector(
                                "#aod-offer-price .a-color-base .a-size-base"
                            ).innerText;
                        }
                        data.push({
                            sellerName,
                            price,
                            shippingPrice,
                        });
                    });
                    return data;
                });
                console.log("offers", requestUrl, offers);
                offers.forEach((offer) => {
                    Apify.pushData({
                        title: title,
                        url: url,
                        description: description,
                        keyword: keyword,
                        sellerName: offer.sellerName,
                        price: offer.price,
                        shippingPrice: offer.shippingPrice,
                    });
                });
                break;
        }
    };

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        useSessionPool: true,
        sessionPoolOptions: {
            maxPoolSize: 100,
        },
        handlePageTimeoutSecs: 10000,
        persistCookiesPerSession: true,
        maxConcurrency: 3,
        launchContext: {
            launchOptions: {
                headless: false,
            },
        },
        handlePageFunction,
    });

    await crawler.run();
});
