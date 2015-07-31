/**
 * Принадлежность товара пользователю
 */
function UserProduct(userId, productId) {
	this.user_id = userId;
	this.product_id = productId;
}

exports.UserProduct = UserProduct;
