const Apify = require("apify");
const axios = require("axios");

Apify.main(async () => {
    const {
        resource: { defaultDatasetId },
    } = await Apify.getInput();

    const { data: allOffers } = await axios.get(
        `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?format=json`
    );

    const cheapestOffers = {};

    allOffers.forEach((offer) => {
        const { price, url } = offer;

        if (!cheapestOffers[url]) cheapestOffers[url] = offer;
        else if (
            Number.parseFloat(price.slice(1).replace(",", "")) <
            Number.parseFloat(
                cheapestOffers[url].price.slice(1).replace(",", "")
            )
        )
            cheapestOffers[url] = offer;
    });

    const data = [];
    for (const key in cheapestOffers) {
        data.push(cheapestOffers[key]);
    }
    await Apify.pushData(data);
});
