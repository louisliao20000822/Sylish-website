const router = require('express').Router();

const {
    wrapAsync,
    authentication
} = require('../../util/util');

const {
    signUp,
    signIn,
    getUserProfile,
    getUserDiscount,
    InsertCard,
    InsertBirth,
    addDiscount,
    addComment,
    commentCheck,
    InsertLineUUID,
    editprofile,
    getLineToken,
} = require('../controllers/user_controller');
const {
    USER_ROLE
} = require('../models/user_model');

router.route('/user/signup')
    .post(wrapAsync(signUp));

router.route('/user/signin')
    .post(wrapAsync(signIn));

router.route('/user/profile')
    .get(authentication(2), wrapAsync(getUserProfile));

router.route('/user/card')
    .post(authentication(2),wrapAsync(InsertCard));

router.route('/user/birthday')
    .post(authentication(2),wrapAsync(InsertBirth));

router.route('/user/editprofile')
    .post(authentication(2),wrapAsync(editprofile));

router.route('/user/lineuuid')
  .post(authentication(2),wrapAsync(InsertLineUUID));

router.route('/user/getToken')
  .post(wrapAsync(getLineToken));

router.route('/user/discount')
    .get(authentication(), wrapAsync(getUserDiscount));

router.route('/user/addComment')
    .post(authentication(2), wrapAsync(addComment));

router.route('/user/commentCheck')
    .post(authentication(2), wrapAsync(commentCheck))

router.route('/user/addDiscount')
    .post(authentication(2),wrapAsync(addDiscount))
module.exports = router;