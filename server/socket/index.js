// @flow
const sequelize = require('sequelize')
const db = require('../db/models')
const Player = require('../poker/player.js')
const Table = require('../poker/table.js')

const tables = {}
const players = {}

tables[1] = new Table(1, 'Table 1', 3, 10, 'free')
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

    socket.on('sitAndPlayStart', async (accountId) => {
      const tableId = 1;
      
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

      const amount = 150;
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
      if (seat) {
        await updatePlayerBankroll(seat.player, seat.stack)
      }

      delete players[socket.id]
      removeFromTables(socket.id)

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
      setTimeout(async () => {
        table.changeTurn(seatId)
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
    
    
          } else {
            await saveHandHistory(table)
            await broadcastRake(table)
            initNewHand(table)
          }
    
        }
      }, 1000)
    }

    function initNewHand(table) {
      table.clearWinMessages()
      if (table.activePlayers().length > 1) {
        broadcastToTable(table, '---New hand starting in 5 seconds---')
      }
      setTimeout(() => {
          table.startHand()
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