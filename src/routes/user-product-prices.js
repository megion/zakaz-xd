var router = require('express').Router();

var userProductService = require('../service/userProductService');
var userProductPriceService = require('../service/userProductPriceService');
var checkAccess = require('../middleware/checkAccess');
var loadUser = require('../middleware/loadUser');
var ACCESSES = require('../utils/accesses').ACCESSES;
var pagination = require('../utils/pagination');
var ObjectID = require('mongodb').ObjectID;

router.get('/user-product-prices-by-user-product-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var id = new ObjectID(req.param('id'));
    var page = pagination.createMongodbPage(req);

    userProductPriceService.findUserProductPricesByUserProductId(page, id, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.post('/create-user-product-price', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var userProductPrice = req.body.userProductPrice;

    userProductPrice.userProduct_id = new ObjectID(userProductPrice.userProduct._id);
    delete userProductPrice.userProduct;

    userProductPrice.createdDate = new Date();

    userProductService.createUserProducts([userProduct], function(err, newUserProduct) {
        if (err)
            return next(err);

        res.send({});
    });
});

router.post('/edit-user-product', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var userProduct = req.body.userProduct;

    var id = new ObjectID(userProduct._id);
    delete userProduct._id; // не изменяемое поле
    delete userProduct.createdDate; // не изменяемое поле
    delete userProduct.product; // не изменяемое поле

    userProduct.user_id = new ObjectID(userProduct.user._id);
    delete userProduct.user;

    userProductService.editUserProduct(id, userProduct, function(err, _product) {
        if (err)
            return next(err);

        res.send(_product);
    });
});

router.get('/user-product-by-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var id = new ObjectID(req.param('id'));

    userProductService.findOneById(id, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.post('/delete-user-product', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var id = new ObjectID(req.param('id'));

    userProductService.deleteUserProduct(id, function(err) {
        if (err)
            return next(err);

        res.send({});
    });
});

module.exports = router;
