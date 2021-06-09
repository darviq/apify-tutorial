const Apify = require("apify");
const routes = require("./routes");

exports.createRouter = (globalContext) => {
    return async function (routeName, requestContext) {
        const route = routes[routeName];
        if (!route) throw new Error(`No route for name: ${routeName}`);
        return route(requestContext, globalContext);
    };
};
