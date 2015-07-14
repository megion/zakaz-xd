/**
 * у товара атрибутты: наименование, тип (вес/штука), единица измерения (кг, штука, полет, коробка), кратность в упаковке
 * @param title
 */
function Product(title, measureUnit, packageMultiplicity) {
    this.title = title; // наименование товара
    this.measureUnit = measureUnit; // единица измерения
    this.packageMultiplicity = packageMultiplicity; // кратность в упаковке
    this.createdDate = new Date(); // дата создания
}

exports.Product = Product;
