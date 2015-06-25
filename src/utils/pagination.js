/**
 * Create mongodb page info by request object
 */
function createMongodbPage(req) {
    var itemsPerPage = req.param('itemsPerPage');
    var page = req.param('page');
    if (itemsPerPage && page) {
        var pageInt = parseInt(page);
        var limit = parseInt(itemsPerPage);
        var skip = (page - 1) * limit;
        return {skip: skip, limit: limit};
    }
    return null;
}

exports.createMongodbPage = createMongodbPage;
