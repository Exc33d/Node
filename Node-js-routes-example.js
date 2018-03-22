const express = require('express');

const router = express.Router();

const productController = require('../controllers/ProductController');
const productAttributeController = require('../controllers/ProductAttributesController');
const orderController = require('../controllers/OrderController');
const configController = require('../controllers/ConfigController');
const apiControllers = require('../controllers/ApiController');

router.get('/productNames', productController.productNames);
router.get('/searchProduct', productController.searchProduct);
router.post('/products', productController.list);
router.post('/config', configController.get);
router.post('/product/show', productController.show);
router.post('/productsByCompany', productController.getProductsByCompany);
router.post('/productAttributes', productAttributeController.show);

router.post('/saveOrder', orderController.saveOrder);
router.post('/order/list', orderController.list);

router.get('/sellersList');
router.get('/getGeneralGeoMap', apiControllers.getGeneralGeoMap);

module.exports = router;
