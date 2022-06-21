class Player {
  constructor(socketId, id, name, bankroll, accountId = null) {
    this.socketId = socketId,
    this.id = id,
    this.name = name,
    this.bankroll = bankroll,
    this.accountId = null,
  }
  decreaseTicketsCount(){
    this.tickets -= 1
  }
  getTickets(){
    return this.tickets
  }
}

module.exports = Player