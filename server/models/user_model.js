require('dotenv').config();
const bcrypt = require('bcrypt');
const got = require('got');
const {pool} = require('./mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);
const {TOKEN_EXPIRE, TOKEN_SECRET} = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Defining algorithm
const algorithm = 'aes-192-cbc';

// Defining password
const password = 'bncaskdbvasbvlaslslasfhj';

// Defining key
const key = crypto.scryptSync(password, 'GfG', 24);

const iv = Buffer.alloc(16, 0);

const USER_ROLE = {
    ALL: -1,
    ADMIN: 1,
    USER: 2
};

const signUp = async (name, roleId, email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const emails = await conn.query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
        if (emails[0].length > 0){
            await conn.query('COMMIT');
            return {error: 'Email Already Exists'};
        }

        const loginAt = new Date();

        const user = {
            provider: 'native',
            role_id: roleId,
            email: email,
            password: bcrypt.hashSync(password, salt),
            name: name,
            picture: null,
            access_expired: TOKEN_EXPIRE,
            login_at: loginAt
        };
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET);
        user.access_token = accessToken;

        const queryStr = 'INSERT INTO user SET ?';
        const [result] = await conn.query(queryStr, user);

        user.id = result.insertId;
        await conn.query('COMMIT');
        return {user};
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const nativeSignIn = async (email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const [users] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);
        const user = users[0];
        if (!bcrypt.compareSync(password, user.password)){
            await conn.query('COMMIT');
            return {error: 'Password is wrong'};
        }
        const loginAt = new Date();
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET);

        const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
        await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.id]);
        await conn.query('COMMIT');

        user.access_token = accessToken;
        user.login_at = loginAt;
        user.access_expired = TOKEN_EXPIRE;

        return {user};
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const facebookSignIn = async (id, roleId, name, email) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const loginAt = new Date();
        let user = {
            provider: 'facebook',
            role_id: roleId,
            email: email,
            name: name,
            picture:'https://graph.facebook.com/' + id + '/picture?type=large',
            access_expired: TOKEN_EXPIRE,
            login_at: loginAt
        };
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET);
        user.access_token = accessToken;

        const [users] = await conn.query('SELECT id FROM user WHERE email = ? AND provider = \'facebook\' FOR UPDATE', [email]);
        let userId;
        if (users.length === 0) { // Insert new user
            const queryStr = 'insert into user set ?';
            const [result] = await conn.query(queryStr, user);
            userId = result.insertId;
        } else { // Update existed user
            userId = users[0].id;
            const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ?  WHERE id = ?';
            await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, userId]);
        }
        user.id = userId;

        await conn.query('COMMIT');
        return {user};
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const getUserDetail = async (email, roleId) => {
    try {
        if (roleId) {
            const [users] = await pool.query('SELECT * FROM user WHERE email = ? AND role_id = ?', [email, roleId]);
            return users[0];
        } else {
            const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
            return users[0];
        }
    } catch (e) {
        return null;
    }
};

const getFacebookProfile = async function(accessToken){
    try {
        let res = await got('https://graph.facebook.com/me?fields=id,name,email&access_token=' + accessToken, {
            responseType: 'json'
        });
        return res.body;
    } catch (e) {
        console.log(e);
        throw('Permissions Error: facebook access token is wrong');
    }
};

const getUserDiscount = async (mail)=>{
    try {
        if (mail) {
            const [discounts] = await pool.query('SELECT * FROM discount WHERE userMail = ?', mail);
            return discounts;
        }
    } catch (e) {
        return null;
    }
}


const InsertCard = async function(email,cardNum){
    try {
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            let encrypted = cipher.update(cardNum, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            console.log(encrypted);
            const [users] = await pool.query("UPDATE user SET Card = ? WHERE email = ?;", [encrypted,email]);
            return users[0];

    } catch (e) {
        console.log(e);
        return null;
    }
};

const getCard = async function(email){
    try {
            const CardNum= (await pool.query("SELECT Card FROM user WHERE email = ?;", [email]))[0][0].Card;
            if(CardNum==null)
                return null;
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(CardNum, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            const last4 = String(decrypted).slice(-4);
            return last4;

    } catch (e) {
        console.log(e);
        return null;
    }
};


const InsertBirth = async function(birthday,email){
    try {
        const [users] = await pool.query("UPDATE user SET Birthday = ? WHERE email = ?;", [birthday,email]);
        return users[0];

    } catch (e) {
        console.log(e);
        return null;
}
}

const InsertLineUUID = async function(lineuuid,email){
    if(lineuuid==='null')lineuuid=null;
    try {
        const [users] = await pool.query("UPDATE user SET lineuuid = ? WHERE email = ?;", [lineuuid,email]);
        return users[0];

    } catch (e) {
        console.log(e);
        return null;
    }
}

const addDiscount = async(discountNumber,userId,cate,substract,times,mail) =>{
    try{
        const[discount]=await pool.query("INSERT INTO discount(discountNumber,userId,cate,substract,times,userMail) VALUES (?,?,?,?,?,?)",[parseInt(discountNumber),parseInt(userId),cate,parseInt(substract),parseInt(times),mail]);
        return discount;
    }catch(e){
        console.log(e)
        return null;
    }
}
const discountCheck = async(userId,discountNumber) => {
    try{
        const [exist]=await pool.query('SELECT EXISTS (SELECT dId FROM discount WHERE userId=? AND discountNumber=?) AS Output',[userId,discountNumber]);
        return exist[0].Output;
    }catch(e){
        console.log(e)
        return null
    }
}
const addComment = async (userId,email,grade,content,pId) => {
    try{
        await pool.query('INSERT INTO comments(userId,userEmail,grade,`text`,pId) VALUES (?,?,?,?,?)',[userId,email,parseInt(grade),content,parseInt(pId)]);
    }catch(e){
        console.log(e)
    }
}

const commentCheck = async (userId,pId) => {
    try{
        const [existOrder]=await pool.query('SELECT EXISTS (SELECT id FROM order_table WHERE user_id=? AND details LIKE "%?%") AS Output',[userId,parseInt(pId)]);
        // return existOrder[0].Output;
        if(existOrder[0].Output === 0){
            return existOrder[0].Output;
        }else if (existOrder[0].Output === 1 ){
            const [existComment] = await pool.query('SELECT EXISTS (SELECT cId FROM comments WHERE userId=? AND pId=?) AS Output',[userId,parseInt(pId)]);
            if(existComment[0].Output === 1){
                return 0;
            }else{
                return 1;
            }

        }

    }catch(e){
        console.log(e)
        return null
    }
}

const editprofile = async function(email,birthday,phone,address){
    try {
        const [users] = await pool.query("UPDATE user SET Birthday = ? , phone = ? , address = ? WHERE email = ?;",
                                         [birthday,phone,address,email]);
        return users[0];

    } catch (e) {
        console.log(e);
        return null;
}
}

const getLineToken = async (lineUUID) => {
    try {
        const [users] = await pool.query('SELECT * FROM user WHERE lineuuid = ? ', [lineUUID]);
        return users[0];
    } catch (e) {
        return null;
    }
};

module.exports = {
    USER_ROLE,
    signUp,
    nativeSignIn,
    facebookSignIn,
    getUserDetail,
    getFacebookProfile,
    getUserDiscount,
    addComment,
    commentCheck,
    InsertCard,
    InsertBirth,
    editprofile,
    getCard,
    addDiscount,
    discountCheck,
    InsertLineUUID,
    getLineToken,
};