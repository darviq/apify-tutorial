const Apify = require("apify");
const axios = require("axios");

Apify.main(async () => {
    const { resource } = await Apify.getInput();
    const datasetId = resource.defaultDatasetId;
    const allOffers = await axios
        .get(`https://api.apify.com/v2/datasets/${datasetId}/items?format=json`)
        .then((res) => res.data);
    const modelURLs = [];
    allOffers.forEach((offer) => {
        modelURLs.every((modelURL) => modelURL !== offer.url) &&
            modelURLs.push(offer.url);
    });

    const cheapestOffers = modelURLs.map((modelURL) => {
        let cheapOffer = allOffers.find((offer) => offer.url === modelURL);
        allOffers.forEach((offer) => {
            if (
                offer.url === modelURL &&
                Number.parseFloat(offer.price.slice(1).replace(",", "")) <
                    Number.parseFloat(
                        cheapOffer.price.slice(1).replace(",", "")
                    )
            ) {
                cheapOffer = offer;
            }
        });
        return cheapOffer;
    });
    await Apify.pushData(cheapestOffers);
});
