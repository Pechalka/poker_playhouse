const Table = require('./table.js')

class TablePool {
    constructor(){
        this.tables = {}
    }

    addTable(table){
        this.tables[table.id] = table
        return table
    }

    removeTable(table){
        this.tables[table.id]
    }

    getTable(tableId){
        return this.tables[tableId]
    }
    
    getActiveTables(){
        return Object.keys(this.tables)
    }
    
}

class TableBroker {
    constructor(){
        this.tableDraft = new Table(0,"Player pool", 2, 1500, 'sit&go')
        this.activeTables = new TablePool()
        this.playersQueue = new Table(1,"Players queue", 2, 1500, 'sit&go')

    }

    getPlayer(){
       return this.playersQueue.players.unshift()
    }

    attachPlayerToDraftTable(player){
        this.tableDraft.addPlayer(player)
            
        const amount = 10;

        player.bankroll = amount
        
        const seatIndex = Object.keys(this.tableDraft.seats).find(notNull => this.tableDraft.seats[notNull])
        
        const seatIndexCalculated = seatIndex ? `${parseInt(seatIndex)+1}` : "1" 

        this.tableDraft.sitPlayer(player, seatIndexCalculated, amount)

        return seatIndexCalculated
    }

    activateDraftTable(){
        /**
         * create new table
         */
         const tableId = Object.keys(this.activeTables).length + Math.floor((new Date()).getTime() / 1000)
        
         const tableNew = new Table(tableId, tableId, 9, 20, "sit&go")
 
         /**
          * use splice for clone arrays without loosing links 
          */
         const players = this.tableDraft.players.splice(-1)
     
         tableNew.players = players
 
         tableNew.seats = this.tableDraft.seats
 
         this.tableDraft.seats = Object.keys(this.tableDraft.seats).reduce((seats,index)=>{
             seats[index]=null
             return seats
         },{})
 
         this.activeTables.addTable(tableNew)

         return tableId
    }

    /**
     * 1) check if draft table can seat players
     * 2) if doesnt exist create new
    */
    addPlayer(player){
        const isPlayerCanJoin = this.tableDraft.canJoin()
        /**
         * if draft not full add player to draft
         * else add draft players to new Table and add new Table to activePool
         */

        if(isPlayerCanJoin){
            const seatId = this.attachPlayerToDraftTable(player)

            if(this.tableDraft.canJoin()){            
                return {
                    tableId:this.tableDraft.id,
                    seatId
                }
            }

            const tableId = this.activateDraftTable()
            
            return {
                seatId,
                tableId
            }

        }

        //condition when canJoin false only if tableDraft is full
        
        const seatId = attachPlayerToDraftTable(player)

        return {
            tableId: this.tableDraft.id,
            seatId
        }
    }

}

module.exports = TableBroker