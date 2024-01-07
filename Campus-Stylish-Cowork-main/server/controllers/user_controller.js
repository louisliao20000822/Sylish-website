require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');

const signUp = async (req, res) => {
    let {name} = req.body;
    const {email, password} = req.body;

    if(!name || !email || !password) {
        res.status(400).send({error:'Request Error: name, email and password are required.'});
        return;
    }

    if (!validator.isEmail(email)) {
        res.status(400).send({error:'Request Error: Invalid email format'});
        return;
    }

    name = validator.escape(name);

    const result = await User.signUp(name, User.USER_ROLE.USER, email, password);
    if (result.error) {
        res.status(403).send({error: result.error});
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    res.status(200).send({
        data: {
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        }
    });
};

const nativeSignIn = async (email, password) => {
    if(!email || !password){
        return {error: 'Request Error: email and password are required.', status: 400};
    }

    try {
        return await User.nativeSignIn(email, password);
    } catch (error) {
        return {error};
    }
};

const facebookSignIn = async (accessToken) => {
    if (!accessToken) {
        return {error: 'Request Error: access token is required.', status: 400};
    }

    try {
        const profile = await User.getFacebookProfile(accessToken);
        const {id, name, email} = profile;

        if(!id || !name || !email){
            return {error: 'Permissions Error: facebook access token can not get user id, name or email'};
        }

        return await User.facebookSignIn(id, User.USER_ROLE.USER, name, email);
    } catch (error) {
        return {error: error};
    }
};

const signIn = async (req, res) => {
    const data = req.body;

    let result;
    switch (data.provider) {
        case 'native':
            result = await nativeSignIn(data.email, data.password);
            break;
        case 'facebook':
            result = await facebookSignIn(data.access_token);
            break;
        default:
            result = {error: 'Wrong Request'};
    }

    if (result.error) {
        const status_code = result.status ? result.status : 403;
        res.status(status_code).send({error: result.error});
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    res.status(200).send({
        data: {
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        }
    });
};

const getUserProfile = async (req, res) => {
    res.status(200).send({
        data: {
            provider: req.user.provider,
            name: req.user.name,
            email: req.user.email,
            picture: req.user.picture,
            lineuuid: req.user.lineuuid,
            card : req.user.card,
            birthday: req.user.birthday,
            address: req.user.address,
            phone: req.user.phone,
            spend: req.user.spend,

        }
    });
    return;
};

const getUserDiscount = async(req,res)=>{
    const discounts = await User.getUserDiscount(req.user.email)
    res.status(200).send({
        data:discounts
    })
}

const addComment = async(req,res) =>{
    let {grade,content,pId} = req.body;
    const email = req.user.email;
    return await User.addComment(req.user.id,email,grade,content,pId);
}

const commentCheck = async(req,res) => {
    const result = await User.commentCheck(req.user.id,req.body.pId);
    res.status(200).send({
        result:result
    })
}



const InsertCard = async (req, res) => {

    let result = await User.InsertCard(req.user.email,req.body.card);
    res.status(200).send({
    });
    return;
};

const InsertBirth = async (req, res) => {

    let result = await User.InsertBirth(req.body.birthday,req.user.email);
    res.status(200).send({
    });
    return;
};

const editprofile = async (req, res) => {
    console.log(req.body.phone);
    if(req.body.card!==""){
        let result = await User.InsertCard(req.user.email,req.body.card);
    }
    if(req.body.birthday==""){
        req.body.birthday=req.user.birthday;
    }
    if(req.body.phone==""){
        req.body.phone=req.user.phone;
    }
    if(req.body.address==""){
        req.body.address=req.user.address;
    }

    let result = await User.editprofile(req.user.email,req.body.birthday,
                                        req.body.phone,req.body.address);
    res.status(200).send({
    });
    return;
};

const InsertLineUUID = async (req, res) => {

    let result = await User.InsertLineUUID(req.body.lineuuid,req.user.email);
    res.status(200).send({
    });
    return;
};

const addDiscount = async(req,res) => {
    const check= await User.discountCheck(req.user.id, req.body.discountNumber);
    if(check===0){
         await User.addDiscount(req.body.discountNumber, req.user.id, req.body.cate, req.body.substract, req.body.times, req.user.email)
         res.status(200).send({
        });
    }else{
        res.status(200).send({
            message:'優惠券已存在!'
        });
    }
}

const getLineToken = async (req, res) => {
    if(req.body.secret==="1qazxsw2"){
        const LineToken = await User.getLineToken(req.body.lineuuid);
        if(LineToken.access_token!==null){
        res.status(200).send({
            data: {
                lineToken: LineToken.access_token,
            }
        });}else{
            res.status(403).send({
                error: 'Wrong Request',
            });
        }
    }else {
        res.status(403).send({
            error: 'Wrong Request',
        });
    }
    return;
};

module.exports = {
    signUp,
    signIn,
    getUserProfile,
    getUserDiscount,
    addComment,
    commentCheck,
    InsertCard,
    InsertBirth,
    editprofile,
    addDiscount,
    InsertLineUUID,
    getLineToken,
};
