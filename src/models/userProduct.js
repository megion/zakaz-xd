/**
 * Принадлежность товара пользователю
 */
function UserProduct(userId, productId) {
	this.user_id = userId;
	this.product_id = productId;
    this.productPrice = null; // цена товара, назаначенная пользователю
}

exports.UserProduct = UserProduct;
