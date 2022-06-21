class Player {
  constructor(socketId, id, name, bankroll, accountId = null, account = null) {
    this.socketId = socketId,
    this.id = id,
    this.name = name,
    this.bankroll = bankroll,
    this.accountId = null
    this.account = account
  }
}

module.exports = Player