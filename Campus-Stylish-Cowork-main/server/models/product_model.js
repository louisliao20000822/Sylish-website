const {pool} = require('./mysqlcon');

const createProduct = async (product, variants, images) => {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('INSERT INTO product SET ?', product);
        await conn.query('INSERT INTO variant(color_id, product_id, size, stock) VALUES ?', [variants]);
        await conn.query('INSERT INTO product_images(product_id, image) VALUES ?', [images]);
        return result.insertId;
    } catch (error) {
        console.log(error)
        return -1;
    } finally {
        await conn.release();
    }
};

const getProducts = async (pageSize, paging = 0, requirement = {}) => {
    const condition = [];
    if (requirement.category) {
        condition.sql = 'WHERE category = ?';
        condition.binding = [requirement.category];
    } else if (requirement.keyword != null) {
        condition.sql = 'WHERE title LIKE ?';
        condition.binding = [`%${requirement.keyword}%`];
    } else if (requirement.id != null) {
        condition.sql = 'WHERE id = ?';
        condition.binding = [requirement.id];
    } else{
        condition.sql ="";
        condition.binding = [];
    }

    const limit = {
        sql: 'LIMIT ?, ?',
        binding: [pageSize * paging, pageSize]
    };

    const productQuery = 'SELECT * FROM product ' + condition.sql + ' ORDER BY id ' + limit.sql;
    const productBindings = condition.binding.concat(limit.binding);
    const [products] = await pool.query(productQuery, productBindings);

    const productCountQuery = 'SELECT COUNT(*) as count FROM product ' + condition.sql;
    const productCountBindings = condition.binding;

    const [productCounts] = await pool.query(productCountQuery, productCountBindings);

    return {
        'products': products,
        'productCount': productCounts[0].count
    };
};

const getHotProducts = async (hotId) => {
    const productQuery = 'SELECT product.* FROM product INNER JOIN hot_product ON product.id = hot_product.product_id WHERE hot_product.hot_id = ? ORDER BY product.id';
    const productBindings = [hotId];
    const [hots] = await pool.query(productQuery, productBindings);
    return hots;
};

const getProductsVariants = async (productIds) => {
    const queryStr = 'SELECT * FROM variant INNER JOIN color ON variant.color_id = color.id WHERE product_id IN (?)';
    const bindings = [productIds];
    const [variants] = await pool.query(queryStr, bindings);
    return variants;
};

const getProductsImages = async (productIds) => {
    const queryStr = 'SELECT * FROM product_images WHERE product_id IN (?)';
    const bindings = [productIds];
    const [variants] = await pool.query(queryStr, bindings);
    return variants;
};

const getProductComments = async (productId) => {
    const [result] = await pool.query('SELECT a.*,b.`name`,b.picture FROM comments AS a, `user` AS b WHERE pId=? AND a.userId=b.id',parseInt(productId));
    return result;
}
const getCollections = async (user_id) => {
    const queryStr = 'SELECT *  FROM collection  JOIN product ON product.id = collection.product_id WHERE collection.u_id = ?';
    const bindings = [user_id];
    const [collection] = await pool.query(queryStr, bindings);
    return collection;
}

const getCollection = async (user_id, product_id) => {
    const queryStr = 'SELECT * FROM collection WHERE u_id = ? AND product_id = ?';
    const bindings = [user_id, product_id];
    const [collection] = await pool.query(queryStr, bindings);
    return collection;
}

const addCollection = async (user_id, product_id) => {
    const queryStr = 'INSERT INTO collection(u_id, product_id) VALUES (?, ?)';
    const bindings = [user_id, product_id];
    const [collection] = await pool.query(queryStr, bindings);
    return collection;
}

const deleteCollection = async (user_id, product_id) => {
    const queryStr = 'DELETE FROM collection WHERE u_id = ? AND product_id = ?';
    const bindings = [user_id, product_id];
    const [collection] = await pool.query(queryStr, bindings);
    return collection;
}

module.exports = {
    createProduct,
    getProducts,
    getHotProducts,
    getProductsVariants,
    getProductsImages,
    getProductComments,
    getCollections,
    getCollection,
    addCollection,
    deleteCollection
};