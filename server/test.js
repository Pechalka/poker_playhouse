const db = require('./db/models')
const {col, fn} = require('sequelize')

async function run(){
    return await db.User.findAll({
        attributes:[[col('User.username'), 'nickname'], [fn("sum",col('Accounts.Statistics.tokens')), 'tokens'], [col('Accounts.Statistics.points'), 'points']],
        include: [{
            attributes:["id"],
            model: db.Account,
            include: [{
                model:db.Statistics,
                attributes:["points", "tokens","account_id"]
            }]
        }],
        order:[
            // [col("points"), "ASC"]
            // [{model: db.Account, as: 'account'}, 'level', 'DESC'],
        ]
    });
}

run().then(results=>results.map(res=>console.log(res.toJSON())))