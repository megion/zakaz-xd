/**
 * Create mongodb page info by request object
 */
function createMongodbPage(req) {
    var itemsPerPage = req.param('itemsPerPage');
    var page = req.param('page');
    return createPage(page, itemsPerPage);
}

/**
 *
 */
function createPage(page, itemsPerPage) {
    if (itemsPerPage && page) {
        var pageInt = parseInt(page);
        var limit = parseInt(itemsPerPage);
        var skip = (page - 1) * limit;
        return {skip: skip, limit: limit};
    }
    return null;
}

function createMongodbPageFromRequestBody(bodyRequest) {
	if (bodyRequest.page) {
		return createPage(bodyRequest.page.page, bodyRequest.page.itemsPerPage);
	}
	return null;
}

exports.createMongodbPageFromRequestBody = createMongodbPageFromRequestBody;
exports.createMongodbPage = createMongodbPage;
