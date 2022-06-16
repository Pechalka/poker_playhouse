const db = require('./db/models')
const {col, fn} = require('sequelize')

async function run(){
    return await db.Account.findAll({
        attributes:["id", "name"],
        include: [{
            model:db.Statistics,
            attributes:["tokens","account_id",[fn("sum",col('Statistics.tokens')), 'tokens']],
        }],
        group:["Account.id","Statistics.account_id","Account.name","Statistics.tokens"],
    });
}

run().then(results=>results.map(res=>console.log(res.toJSON())))