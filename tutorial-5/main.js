const Apify = require("apify");
const ApifyClient = require("apify-client");
const axios = require("axios");

Apify.main(async () => {
    const { memory, useClient, fields, maxItems } = await Apify.getInput();
    const token = process.env.APIFY_TOKEN;
    const taskId = "8YZSqj4pbiDlASe5J";
    let outputData;
    if (useClient) {
        const apifyClient = new ApifyClient({ token });
        const taskClient = apifyClient.task(taskId);
        const { defaultDatasetId: datasetId } = await taskClient.call(
            {},
            { memory }
        );
        const datasetClient = apifyClient.dataset(datasetId);
        outputData = await datasetClient.downloadItems("csv", {
            limit: maxItems,
            fields,
        });
    } else {
        const { data } = await axios.post(
            `https://api.apify.com/v2/actor-tasks/${taskId}/runs?token=${token}&memory=${memory}&waitForFinish=300`
        );
        const datasetId = data.data.defaultDatasetId;
        const fieldsString = fields.join();
        const { data: responseData } = await axios.get(
            `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&format=csv&limit=${maxItems}&fields=${fieldsString}`
        );
        outputData = responseData;
    }
    await Apify.setValue("OUTPUT", outputData, {
        contentType: "text/csv",
    });
});
