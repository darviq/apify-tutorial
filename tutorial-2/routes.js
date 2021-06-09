const Apify = require("apify");

exports.SEARCH_PAGE_HANDLER = async ({ request, page }, { requestQueue }) => {
    const { keyword } = request.userData;
    await page.waitForSelector(".s-asin");
    const asins = await page.$$eval(".s-asin", (products) => {
        const data = [];
        products.forEach((product) => {
            !product.classList.contains("AdHolder") &&
                data.push(product.getAttribute("data-asin"));
        });
        return data;
    });
    ////////////////////////////
    // console.log(asins, "\n");
    ////////////////////////////
    await asins.forEach(async (oneAsin) => {
        await requestQueue.addRequest({
            url: `https://www.amazon.com/dp/${oneAsin}`,
            userData: {
                label: "PRODUCT_PAGE_HANDLER",
                asin: oneAsin,
                keyword,
            },
        });
    });
};

exports.PRODUCT_PAGE_HANDLER = async ({ request, page }, { requestQueue }) => {
    const { url: requestUrl, userData } = request;
    const { asin, keyword } = userData;
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
    ////////////////////////////////////////////////////////////////////////
    // console.log("Title: ", productTitle);
    // console.log("URL: ", requestUrl);
    // console.log("Description length: ", productDescription.length, "\n");
    ////////////////////////////////////////////////////////////////////////
    await requestQueue.addRequest({
        url: `https://www.amazon.com/gp/offer-listing/${asin}`,
        userData: {
            label: "OFFERS_PAGE_HANDLER",
            asin,
            title: productTitle,
            url: requestUrl,
            description: productDescription,
            keyword,
        },
    });
};

exports.OFFERS_PAGE_HANDLER = async ({ request, page }, { requestQueue }) => {
    const { asin, title, url, description, keyword } = request.userData;
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
    if (Number.isInteger(offersRequestAmount) && offersRequestAmount > 0) {
        for (let i = 1; i <= offersRequestAmount; i++) {
            await requestQueue.addRequest(
                {
                    url: `https://www.amazon.com/gp/aod/ajax/ref=aod_page_${i}?asin=${asin}&pc=dp&isonlyrenderofferlist=true&pageno=${i}`,
                    userData: {
                        label: "OFFERS_LIST_HANDLER",
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

exports.OFFERS_LIST_HANDLER = async ({ request, page }) => {
    const { title, url, description, keyword } = request.userData;
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
};
