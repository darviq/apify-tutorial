const Apify = require("apify");
const routes = require("./routes");

exports.createRouter = (globalContext) => {
    return async function (label, requestContext, statistics) {
        const route = routes[label];
        if (!route) throw new Error(`No route for name: ${label}`);
        return route(requestContext, globalContext, statistics);
    };
};
