import { DAILY_FREE_TICKETS_NUMBER } from "../dictionary/constants";

const db = require('../db/models')

class RenewAccountTicketsCommand {
    constructor() {
    }

    async run() {
        const totalCounts = await db.Account.count();
        const limit = 5000; // avoid of bulk update all records in table
        for (let i = 0; i * limit < totalCounts; i++) {
            await db.Account.update(
                {
                    tickets: DAILY_FREE_TICKETS_NUMBER
                },
                {
                    where: {

                    },
                    offset: i * limit,
                    limit: limit
                },
            )
        }
    }
}
(new RenewAccountTicketsCommand()).run();
