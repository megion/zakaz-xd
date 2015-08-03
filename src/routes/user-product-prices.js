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

router.get('/user-product-price-by-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var id = new ObjectID(req.param('id'));

    userProductPriceService.findOneById(id, function(err, result) {
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
    console.log("userProductPrice:", userProductPrice);
    if (userProductPrice.priceDate) {
        userProductPrice.priceDate = new Date(userProductPrice.priceDate);
    }

    userProductPriceService.createUserProductPrices([userProductPrice], function(err, results) {
        if (err)
            return next(err);

        res.send(results[0]);
    });
});

router.post('/edit-user-product-price', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var userProductPrice = req.body.userProductPrice;

    var id = new ObjectID(userProductPrice._id);
    delete userProductPrice._id; // не изменяемое поле
    delete userProductPrice.createdDate; // не изменяемое поле
    delete userProductPrice.userPoduct; // не изменяемое поле

    userProductPriceService.editUserProductPrice(id, userProductPrice, function(err, result) {
        if (err)
            return next(err);

        res.send(result);
    });
});

router.post('/delete-user-product-price', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var id = new ObjectID(req.param('id'));

    userProductPriceService.deleteUserProductPrice(id, function(err) {
        if (err)
            return next(err);

        res.send({});
    });
});

module.exports = router;
