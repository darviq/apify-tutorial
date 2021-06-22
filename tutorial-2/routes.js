const Apify = require("apify");
const {
    SEARCH_PAGE_LABEL,
    PRODUCT_PAGE_LABEL,
    OFFERS_PAGE_LABEL,
    OFFERS_LIST_LABEL,
} = require("./constants.json");

exports[SEARCH_PAGE_LABEL] = async ({ request, page }, { requestQueue }) => {
    const {
        userData: { keyword },
    } = request;

    await page.waitForSelector(".s-asin");
    const asins = await page.$$eval(".s-asin", (products) => {
        const data = [];
        products.forEach((product) => {
            !product.classList.contains("AdHolder") &&
                data.push(product.getAttribute("data-asin"));
        });
        return data;
    });

    await asins.forEach(async (asin) => {
        await requestQueue.addRequest({
            url: `https://www.amazon.com/dp/${asin}`,
            userData: {
                label: PRODUCT_PAGE_LABEL,
                asin,
                keyword,
            },
        });
    });
};

exports[PRODUCT_PAGE_LABEL] = async ({ request, page }, { requestQueue }) => {
    const {
        url,
        userData: { asin, keyword },
    } = request;

    await page.waitForSelector("#productTitle");
    const title = await page.$eval("#productTitle", (el) =>
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
    let description = "";
    descriptionParts.forEach((descriptionPart) => {
        description = `${description} ${descriptionPart}`;
    });

    await requestQueue.addRequest({
        url: `https://www.amazon.com/gp/offer-listing/${asin}`,
        userData: {
            label: OFFERS_PAGE_LABEL,
            asin,
            title,
            url,
            description,
            keyword,
        },
    });
};

exports[OFFERS_PAGE_LABEL] = async ({ request, page }, { requestQueue }) => {
    const {
        userData: { asin, title, url, description, keyword },
    } = request;
    const OFFERS_PER_PAGE = 10;

    await page.waitForTimeout(10000);
    const loaded = await page.$("#aod-filter-offer-count-string");
    if (!loaded) throw new Error("ERROR OF OFFERS_PAGE_HANDLER");

    const offersAmountString = await page.$eval(
        "#aod-filter-offer-count-string",
        (amountText) => amountText.innerText
    );
    const offersRequestAmount = Math.ceil(
        Number.parseInt(offersAmountString) / OFFERS_PER_PAGE
    );
    if (Number.isInteger(offersRequestAmount) && offersRequestAmount > 0) {
        for (let i = 1; i <= offersRequestAmount; i++) {
            await requestQueue.addRequest(
                {
                    url: `https://www.amazon.com/gp/aod/ajax/ref=aod_page_${i}?asin=${asin}&pc=dp&isonlyrenderofferlist=true&pageno=${i}`,
                    userData: {
                        label: OFFERS_LIST_LABEL,
                        asin,
                        title,
                        url,
                        description,
                        keyword,
                    },
                },
                { forefront: true }
            );
        }
    }
};

exports[OFFERS_LIST_LABEL] = async (
    { request, page },
    { requestQueue },
    statistics
) => {
    const {
        userData: { asin, title, url, description, keyword },
    } = request;

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

    await Promise.all(
        offers.map(({ sellerName, price, shippingPrice }) => {
            return Apify.pushData({
                title,
                url,
                description,
                keyword,
                sellerName,
                price,
                shippingPrice,
            });
        })
    );

    if (offers.length > 0) {
        (await statistics[asin])
            ? (statistics[asin] += offers.length)
            : (statistics[asin] = offers.length);
    }
};
