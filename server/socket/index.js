// @flow
const sequelize = require('sequelize')
const db = require('../db/models')
const Player = require('../poker/player.js')
const Table = require('../poker/table.js')

const tables = {}
const players = {}
const timeouts = {}

const INTERVAL_TO_INCREASE_BLIND = 60

tables[1] = new Table(1, 'Table 1', 9, 100, 'free')
tables[2] = new Table(2, 'Table 2', 6, 10, 'free')
tables[3] = new Table(3, 'Table 3', 6, 20, 'free')
tables[4] = new Table(4, 'Table 4', 6, 20, 'playToEarn')
tables[5] = new Table(5, 'Table 5', 6, 50, 'playToEarn')
tables[6] = new Table(6, 'Table 6', 9, 10, 'playToEarn')
tables[7] = new Table(7, 'Table 7', 9, 10, 'PvP')
tables[8] = new Table(8, 'Table 8', 9, 20, 'PvP')
tables[9] = new Table(9, 'Table 9', 9, 20, 'PvP')
tables[10] = new Table(10, 'Table 10', 9, 50, 'PvP')

module.exports = {
  init(socket, io) {
    socket.on('fetch_lobby_info', async (user) => {
      players[socket.id] = new Player(socket.id, user.id, user.username, user.bankroll)

      socket.emit('receive_lobby_info', { tables, players, socketId: socket.id })
      socket.broadcast.emit('players_updated', players)
    })

    socket.on('join_table', ({tableId,accountId}) => {
      //TODO check what type of table PvP/Free/PlayToEarn
      /**
       * handle join_table
       * because only input where can check it
       */
      if(accountId){
        players[socket.id].accountId = accountId
      }

      tables[tableId].addPlayer(players[socket.id])
      socket.broadcast.emit('tables_updated', tables)
      socket.emit('table_joined', { tables, tableId })
    })

    function needToReconnect(accountId, socketId){
      let player = null
      for(const tableIndex in tables){
        for(playerOnCheckIndex in tables[tableIndex].players){
          const playerOnCheck = tables[tableIndex].players[playerOnCheckIndex]
          if(playerOnCheck.accountId === accountId){
            // set state on new socket
            players[socketId] = Object.assign({},players[playerOnCheck.socketId])
            // delete old socket
            delete players[playerOnCheck.socketId]
            // change socket id for player in table
            playerOnCheck.socketId = socketId
            player = Object.assign({},playerOnCheck)
          }
        }
      }
      return player
    }

    socket.on('sitAndPlayStart', async (accountId) => {
      const tableId = 1;
      const playerInGame = needToReconnect(accountId, socket.id)
      if(playerInGame){
        socket.emit('table_joined', { tables, tableId })
        io.to(socket.id).emit('game_start')
        return
      }
      const player = players[socket.id]
      if(!player){
        console.log('socket:sitAndPlayStart: player by socket doesnt found')
        return
      }
      player.accountId = accountId

      let account = await db.Account.findOne({
        where: {
          id: accountId
        }
      })
      
      if(account.tickets < 1) {
        console.log('socket:sitAndPlayStart: tickets not enought')
        return;
      }

      const tickets = account.tickets-1
      
      account.set({
        tickets
      })

      account = await account.save()

      player.account = account

      socket.emit('account_update', account);

      const table = tables[tableId]

      table.addPlayer(player)

      const amount = 1500;
      let seatId = -1;

      for(let key in table.seats) {
        if (!table.seats[key]) {
          seatId = +key;
          break;
        }
      }

      socket.broadcast.emit('tables_updated', tables)
      
      socket.emit('table_joined', { tables, tableId })


      table.sitPlayer(player, seatId, amount)
      let message = `${player.name} sat down in Seat ${seatId}`
      
      // updatePlayerBankroll(player, -(amount))
        
      player.bankroll = amount

      broadcastToTable(table, message)

      socket.broadcast.emit('players_updated', players)

     if (table.activePlayers().length === Object.keys(table.seats).length) {
      // if (table.activePlayers().length > 1) {
        //need for calc when increase blind
        table.tournamentStart = new Date();
        
        initNewHand(table)

        for (let i = 0; i < table.players.length; i++) {
          let socketId = table.players[i].socketId
          io.to(socketId).emit('game_start')
        }
      }

    })

    // socket.on('join_table_sit_to_play', ({tableId,accountId}) => {
    //   if(accountId){
    //     players[socket.id].accountId = accountId
    //   }

    //   const table = tables[tableId]

    //   table.addPlayer(players[socket.id])

    //   const player = players[socket.id]

    //   const amount = 10;
    //   let seatId = -1;

    //   for(let key in table.seats) {
    //     if (!table.seats[key]) {
    //       seatId = +key;
    //       break;
    //     }
    //   }


    //   console.log('>> ', table.activePlayers(), Object.keys(table.seats).length)

    //   socket.broadcast.emit('tables_updated', tables)
    //   socket.emit('table_joined', { tables, tableId })


    //     table.sitPlayer(player, seatId, amount)
    //     let message = `${player.name} sat down in Seat ${seatId}`


    //     updatePlayerBankroll(player, -(amount))
    //     broadcastToTable(table, message)


    //     if (table.activePlayers().length === Object.keys(table.seats).length) {
    //       console.log('xxxx');
    //       initNewHand(table)
    //     }



    // })

    socket.on('leave_table', tableId => {
      const table = tables[tableId]
      const player = players[socket.id]
      const seat = Object.values(table.seats).find(seat =>
        seat && seat.player.socketId === socket.id
      )
      if (seat) {
        updatePlayerBankroll(player, seat.stack)
      }

      table.removePlayer(socket.id)

      socket.broadcast.emit('tables_updated', tables)
      socket.emit('table_left', { tables, tableId })

      if (table.activePlayers().length === 1) {
        clearForOnePlayer(table)
      }
    })

    socket.on('fold', tableId => {
      let table = tables[tableId]
      let { seatId, message } = table.handleFold(socket.id)
      broadcastToTable(table, message)
      changeTurnAndBroadcast(table, seatId)
    })

    socket.on('check', tableId => {
      let table = tables[tableId]
      let { seatId, message } = table.handleCheck(socket.id)
      broadcastToTable(table, message)
      changeTurnAndBroadcast(table, seatId)
    })

    socket.on('call', tableId => {
      let table = tables[tableId]
      let { seatId, message } = table.handleCall(socket.id)
      broadcastToTable(table, message)
      changeTurnAndBroadcast(table, seatId)
    })

    socket.on('raise', ({ tableId, amount }) => {
      let table = tables[tableId]
      let { seatId, message } = table.handleRaise(socket.id, amount)
      broadcastToTable(table, message)
      changeTurnAndBroadcast(table, seatId)
    })

    socket.on('table_message', ({ message, from, tableId }) => {
      let table = tables[tableId]
      broadcastToTable(table, message, from)
    })

    socket.on('sit_down', ({ tableId, seatId, amount }) => {
      const table = tables[tableId]
      const player = players[socket.id]

      table.sitPlayer(player, seatId, amount)
      let message = `${player.name} sat down in Seat ${seatId}`

      updatePlayerBankroll(player, -(amount))

      broadcastToTable(table, message)
      if (table.activePlayers().length === 2) {
        initNewHand(table)
      }
    })

    socket.on('rebuy', ({ tableId, seatId, amount }) => {
      const table = tables[tableId]
      const player = players[socket.id]

      table.rebuyPlayer(seatId, amount)
      updatePlayerBankroll(player, -(amount))

      broadcastToTable(table)
    })

    socket.on('stand_up', tableId => {
      const table = tables[tableId]
      const player = players[socket.id]
      const seat = Object.values(table.seats).find(seat =>
        seat && seat.player.socketId === socket.id
      )

      let message = '';
      if (seat) {
        updatePlayerBankroll(player, seat.stack)
        message = `${player.name} left the table`
      }

      table.standPlayer(socket.id)

      broadcastToTable(table, message)
      if (table.activePlayers().length === 1) {
        clearForOnePlayer(table)
      }
    })

    socket.on('sitting_out', ({ tableId, seatId }) => {
      const table = tables[tableId]
      const seat = table.seats[seatId]
      seat.sittingOut = true

      broadcastToTable(table)
    })

    socket.on('sitting_in', ({ tableId, seatId }) => {
      const table = tables[tableId]
      const seat = table.seats[seatId]
      seat.sittingOut = false

      broadcastToTable(table)
      if (table.handOver && table.activePlayers().length === 2) {
        initNewHand(table)
      }
    })

    socket.on('disconnect', async () => {
      const seat = findSeatBySocketId(socket.id)
      let bankroll = 0;
      try {
         bankroll = seat.player.bankroll
      } catch(e) {

      }
      let bankrollExist = false
      
      if(bankroll > 0){
        bankrollExist = true
      }
      
      if (seat) {
        await updatePlayerBankroll(seat.player, seat.stack)
      }
      if(!bankrollExist){
        delete players[socket.id]
        removeFromTables(socket.id)
      }

      socket.broadcast.emit('tables_updated', tables)
      socket.broadcast.emit('players_updated', players)
    })

    async function updatePlayerBankroll(player, amount) {
      const user = await db.User.findByPk(player.id)
      await db.User.update(
        { bankroll: user.bankroll + amount },
        { where: { id: player.id } }
      )

      players[socket.id].bankroll = user.bankroll + amount
      io.to(socket.id).emit('players_updated', players)
    }

    async function broadcastRake(table) {
      /**
       * One handle for all games free/PvP/PlayToEarn
       * thats why need to check if accountId exist
       */
      //get winner id and rake
      const seatsAndCombination = table.getWinners(Object.keys(table.seats).map(seatId => table.seats[seatId]))
      const statistics = Object.keys(table.seats).reduce((acc, seatIndex) => {
        const seat = table.seats[seatIndex];
        if (seat) {
          const isWinner = seatsAndCombination.some(combination => combination[0] == seatIndex);
          const statistic = {
            account_id: seat.player.accountId
          };
          if (isWinner) {
            acc.push(Object.assign(statistic, {
              points: 200,
              tokens: 200
            }))
          } else {
            acc.push(Object.assign(statistic, {
              points: 100,
              tokens: 100
            }))
          }
        }
        return acc;
      }, []);
      if (statistics.length) {
        await db.Statistics.bulkCreate(statistics)
      }
      return
    }

    async function saveHandHistory(table) {
      const seats = Object.keys(table.seats).map(seatId => table.seats[seatId])
      const players = seats.filter(seat => seat != null).map(seat => seat.player)
      const hand = await db.Hand.create({
        history: JSON.stringify(table.history),
      })
      await db.UserHand.bulkCreate(
        players.map(player => ({
          user_id: player.id,
          hand_id: hand.id,
        }))
      );
    }

    function findSeatBySocketId(socketId) {
      let foundSeat = null
      Object.values(tables).forEach(table => {
        Object.values(table.seats).forEach(seat => {
          if (seat && seat.player.socketId === socketId) {
            foundSeat = seat
          }
        })
      })
      return foundSeat
    }

    function removeFromTables(socketId) {
      for (let i = 0; i < Object.keys(tables).length; i++) {
        tables[Object.keys(tables)[i]].removePlayer(socketId)
      }
    }

    function broadcastToTable(table, message = null, from = null) {
      for (let i = 0; i < table.players.length; i++) {
        let socketId = table.players[i].socketId
        let tableCopy = hideOpponentCards(table, socketId)
        io.to(socketId).emit('table_updated', { table: tableCopy, message, from })
      }
    }

    function changeTurnAndBroadcast(table, seatId) {
      // clear prev timeout
      if(timeouts[table.id]){
        clearTimeout(timeouts[table.id])
      }

      setTimeout(async () => {
        //add time for turn
        timeouts[table.id] = setTimeout(()=>{
          //if player doesnt make action current turn in game will be his
          if(table.turn === table.lastTurn){
            let { seatId, message } = table.handleFold(table.seats[table.turn].player.socketId)
            broadcastToTable(table, message)
            changeTurnAndBroadcast(table, seatId)
          }
        },15000)

        table.changeTurn(seatId)
        //last turn is current turn, need for timeout
        table.lastTurn = table.turn

        broadcastToTable(table)

        if (table.handOver) {
          if (table.activePlayers().length === 1) {
            const tableId = table.id;
    
            const players = table.players.map(p => [p.socketId, p.accountId]);
    
            const accountIds = table.players.map(p => p.accountId);

            await db.Account.update({
              experience: sequelize.literal('experience + 16')
            }, {
              where: {
                id: accountIds
              }
            })

            for (let i = 0; i < players.length; i++) {
              let socketId = players[i][0]
              let accountId = players[i][1]

              table.removePlayer(socketId)
              io.to(socketId).emit('table_left', {
                tables,
                tableId
              })

              let account = await db.Account.findOne({
                where: {
                  id: accountId
                }
              })

              io.to(socketId).emit('account_update', account);
            }
    
            table.resetEmptyTable();
            socket.broadcast.emit('tables_updated', tables)
            //if game end clear intervals
            if(timeouts[table.id]){
              clearTimeout(timeouts[table.id])
            }
          } else {
            await saveHandHistory(table)
            await broadcastRake(table)
            initNewHand(table)
          }
    
        }
      }, 1000)
    }

    function initNewHand(table) {
      if(timeouts[table.id]){
        clearTimeout(timeouts[table.id])
      }
      //
      table.clearWinMessages()
      if (table.activePlayers().length > 1) {
        broadcastToTable(table, '---New hand starting in 5 seconds---')
      }
      setTimeout(() => {
          const needIncreaseBlind = (Math.floor(new Date() - table.tournamentStart) / 1000) - INTERVAL_TO_INCREASE_BLIND > 0 ? true : false
          if(needIncreaseBlind){
            table.minBet = table.minBet + table.minBet / 2
            table.tournamentStart = new Date()
          }

          table.startHand()

          table.lastTurn = table.turn
          //on every new hand init timeout for tracking slopock on start
          timeouts[table.id] = setTimeout(()=>{
            if(table.turn === table.lastTurn){
              let { seatId, message } = table.handleFold(table.seats[table.turn].player.socketId)
              broadcastToTable(table, message)
              changeTurnAndBroadcast(table, seatId)
            }
          },15000)
          broadcastToTable(table)
      }, 5000)
    }

    function clearForOnePlayer(table) {
      saveHandHistory(table)

      table.clearWinMessages()
      setTimeout(() => {
        table.clearSeatHands()
        table.resetBoardAndPot()
        broadcastToTable(table, 'Waiting for more players')
      }, 5000)
    }

    function hideOpponentCards(table, socketId) {
      let tableCopy = JSON.parse(JSON.stringify(table))
      let hiddenCard = { suit: 'hidden', rank: 'hidden' }
      let hiddenHand = [hiddenCard, hiddenCard]

      for (let i = 1; i <= tableCopy.maxPlayers; i++) {
        let seat = tableCopy.seats[i]
        if (
          seat &&
          seat.hand.length > 0 &&
          seat.player.socketId !== socketId &&
          !(seat.lastAction === 'WINNER' && tableCopy.wentToShowdown)
        ) {
          seat.hand = hiddenHand
        }
      }
      return tableCopy
    }
  }
}
