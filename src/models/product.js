/**
 * у товара атрибутты: наименование, тип (вес/штука), единица измерения (кг, штука, полет, коробка), кратность в упаковке
 * @param title
 */
function Product(title, measureUnit) {
    this.title = title; // наименование товара
    this.measureUnit = measureUnit; // единица измерения
}

exports.Product = Product;
