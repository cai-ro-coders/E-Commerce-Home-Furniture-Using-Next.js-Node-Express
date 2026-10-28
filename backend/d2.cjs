const mysql = require('mysql2/promise');
(async () => {
const c = await mysql.createConnection({host:'127.0.0.1',user:'root',password:'root',database:'ecommerce_nextjsDB', multipleStatements:false});
 let REVIEW_SELECT = `
  SELECT r.*,
         p.name  AS product_name,
         p.slug  AS product_slug,
         (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id
           ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS product_image,
         u.full_name AS user_name,
         u.email     AS user_email,
         u.avatar    AS user_avatar
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    JOIN users u    ON u.id = r.user_id`;
const sql = `${REVIEW_SELECT}${'WHERE r.status = ?'} ORDER BY r.${'id'} ${'DESC'}, r.id DESC LIMIT ? OFFSET ?`;
console.log('--- SQL ---'); console.log(sql);
try { const [rows] = await c.query(sql, ['approved', 5, 0]); console.log('rows', rows.length); }
catch (e) { console.log('ERR:', e.message); }
})().catch(e=>{console.error(e);process.exit(1)});
