/**
 * SUPPLIER - это мы
 RECIPIENT- посредник
 SENDER - тот кто отправил заказ плательщик или редко точка доставки
 DELIVERYPLACE- точка доставки
 BUYER - плательщик (пользователь)
 EDIINTERCHANGEID - хз
 Products - массив товаров

 title - название заказа, произвольный текст
 number - уникальный текст
 createdDate
 deliveryDate
 message - любой текст
 author - кто сделал заказ
 authorDeliveryPoint - точка доставки
 products - товары

 */
function Order(title, message) {
    this.title = title;
    //this.author_user_id = authorUserId;
    //this.status_id = statusId;
    //this.type_id = typeId;
    this.message = message;
}

exports.Order = Order;
