/**
 * у товара атрибутты: наименование, тип (вес/штука), единица измерения (кг, штука, полет, коробка), кратность в упаковке
 * @param title
 */
function Product(title, measureUnit, type, packageMultiplicity, barcode) {
    this.title = title; // наименование товара
    this.measureUnit = measureUnit; // единица измерения
    this.type = type; // тип товара
    this.packageMultiplicity = packageMultiplicity; // кратность в упаковке
    this.createdDate = new Date(); // дата создания
    this.barcode = barcode; // штрих код
}

exports.Product = Product;
