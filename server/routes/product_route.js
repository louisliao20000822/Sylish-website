const router = require('express').Router();
const {authentication,
    wrapAsync} = require('../../util/util');

const {
    getProducts,
    getCollections,
    getCollection,
    addCollection,
    deleteCollection,
    getProductComments,
} = require('../controllers/product_controller');

router.route('/products/:category')
    .get(wrapAsync(getProducts));

router.route('/products/comments')
    .post(wrapAsync(getProductComments))

router.route('/collections').get(authentication(2),wrapAsync(getCollections));
router.route('/collections/:p_id').get(authentication(2),wrapAsync(getCollection));
router.route('/collections').delete(authentication(2),wrapAsync(deleteCollection));
router.route('/collections').post(authentication(2),wrapAsync(addCollection));

module.exports = router;
