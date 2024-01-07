const router = require('express').Router();
const {wrapAsync} = require('../../util/util');
const {upload} = require('../../util/util');

const cpUpload = upload.fields([
    { name: 'image', maxCount: 1 }
]);

const {
    getCampaigns,
    getHots,
    addsale,
    getsale
} = require('../controllers/marketing_controller');

router.route('/marketing/campaigns')
    .get(wrapAsync(getCampaigns));

router.route('/marketing/hots')
    .get(wrapAsync(getHots));

router.route('/marketing/sale')
    .post(cpUpload,wrapAsync(addsale));

router.route('/marketing/sale')
    .get(wrapAsync(getsale));    

module.exports = router;