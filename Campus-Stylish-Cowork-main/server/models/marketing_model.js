const { pool } = require('./mysqlcon');

const createCampaign = async (campaign) => {
    const [result] = await pool.query('INSERT INTO campaign SET ?', campaign);
    return result.insertId;
};

const createHot = async (title, productIds) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const [hot] = await conn.query('INSERT INTO hot SET ?', {title});
        const hotId = hot.insertId;
        const hotProductMapping = productIds.map(productId => [hotId, productId]);
        await conn.query('INSERT INTO hot_product(hot_id, product_id) VALUES ?', [hotProductMapping]);
        await conn.query('COMMIT');
        return true;
    } catch (e) {
        await conn.query('ROLLBACK');
        return false;
    } finally {
        await conn.release();
    }
};

const getCampaigns = async () => {
    const [campaigns] = await pool.query('SELECT * FROM campaign', []);
    return campaigns;
};

const getHots = async () => {
    const [hots] = await pool.query('SELECT * FROM hot', []);
    return hots;
};

const addsale = async (body) => {
    console.log(body);
    const [sale] = await pool.query('INSERT INTO sale VALUES (0,?,?,?,?)', [body.did,body.cate,body.substract,body.time]);
    return sale;
};

const getsale = async (body) => {
    const [sale] = await pool.query('SELECT * FROM sale');
    return sale;
};

module.exports = {
    createCampaign,
    createHot,
    getCampaigns,
    getHots,
    addsale,
    getsale
};