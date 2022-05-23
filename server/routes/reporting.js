const db = require('../db/models');
const jwt = require('jsonwebtoken');

module.exports = {
    leaderboard(req, res) {
        jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(404).json({
                    error: true,
                    message: 'JWT invalid'
                })
            }
            db.sequelize.query(`SELECT
                u.username,
                    A.ID,
                    SUM ( CASE WHEN ast.is_won = TRUE THEN 200 ELSE 100 END ) AS score ,
                    (CASE WHEN u.id = 1 THEN true ELSE false END) AS isHighlighted
                FROM
                "Users" AS u
                INNER JOIN "Accounts" AS A ON A.user_id = u.
                    ID LEFT JOIN "account_statistics" AS ast ON ast.account_id = A.ID AND ast.date
                BETWEEN '2022-02-07' AND '2022-05-19'
                WHERE u.username LIKE '%%'
                GROUP BY
                u.id,
                    u.username,
                    A.ID,
                    ast.account_id
                ORDER BY score DESC`, {
                replacements: {
                    currentUser: 'open',
                }
            })

                .catch(err => {
                    res.status(500).send(`Internal Server Error: ${err}`)
                })

        })
    }
}
const parseParams = function(req) {
    const queryParams = {};
    const page = req.body.page ? req.body.page : 0;
    const pageSize = 50;
    queryParams.limit = pageSize;
    queryParams.offset = pageSize * page;
    IF ()
}
const buildQuery = function(req) {

}