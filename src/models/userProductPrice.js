/**
 * Связь товар-пользователь с ценой и датой
 */
function UserProductPrice(userProductId, productPrice, priceDate) {
	this.userPoduct_id = userProductId;
    this.productPrice = productPrice; // цена товара, назначенная пользователю на указанную дату
	this.priceDate = priceDate; // дата действия цены
}

exports.UserProductPrice = UserProductPrice;
