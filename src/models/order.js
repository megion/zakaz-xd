/**
 * SUPPLIER - это мы
 RECIPIENT- посредник
 SENDER - тот кто отправил заказ плательщик или редко точка доставки
 DELIVERYPLACE- точка доставки
 BUYER - плательщик (пользователь)
 Products - массив товаров

 title - название заказа, произвольный текст
 number - уникальный текст
 createdDate
 deliveryDate
 comments - список комментариев
 author - кто сделал заказ
 authorDeliveryPoint - точка доставки
 authorProducts - список объектов {product_id - id товара, count - количество товаров, cost - цена, vat - НДС}

 количество отгруженное - запонятеся только при изменени стостояния на Отгружен

 */
function Order(number, deliveryDate, author, authorDeliveryPoint, authorProducts) {
    this.number = number;
    this.createdDate = new Date();
    this.deliveryDate = deliveryDate;
    this.title = null;
    this.authorDeliveryPoint_id = authorDeliveryPoint._id;
    this.author_id = author._id;
    this.status_id = null; // STATUS.CREATED
    this.comments = null;
    this.authorProducts = authorProducts;
}

exports.Order = Order;
