import React from 'react'
import RaiseSlider from './RaiseSlider'
import PotSizeButton from './PotSizeButton'
import Paper from 'material-ui/Paper'
import ActionButtons from './ActionButtons'

class Actions extends React.Component {
  constructor(props) {
    super(props)

    const { user, table } = this.props
    const seat = Object.values(table.seats).filter(seat =>
      seat !== null && seat.player.name === user.username
    )[0]
    
    const raiseAmount = table.minRaise > seat.stack + seat.bet ?
      seat.stack + seat.bet : table.minRaise

    this.state = {
      raiseAmount: raiseAmount
    }

    this.handleRaiseChange = this.handleRaiseChange.bind(this)
  }

  handleRaiseChange(e) {
    const { table } = this.props
    if (e.target.value < table.minRaise || e.target.value > table.maxBet) {
      return
    }
    this.setState({ raiseAmount: e.target.value })
  }

  handleRaiseUpdate(amount) {
    const { table } = this.props
    const seat = this.findOwnSeat()
    let newRaiseAmount = amount

    if (amount < table.minRaise) {
      newRaiseAmount = table.minRaise
    } else if (amount > seat.stack + seat.bet) {
      newRaiseAmount = seat.stack + seat.bet
    }

    this.setState({ raiseAmount: newRaiseAmount })
  }

  findOwnSeat() {
    const { user, table } = this.props
    const seat = Object.values(table.seats).filter(seat =>
      seat !== null && seat.player.name === user.username
    )[0]

    return seat
  }

  render() {
    const { table, onRaiseClick, onCheckClick, onCallClick, onFoldClick } = this.props

    const seat = this.findOwnSeat()
    const totalCallAmount = table.callAmount - seat.bet > seat.stack ? seat.stack : table.callAmount - seat.bet

    let pot = table.pot
    if (table.callAmount) {
      pot = table.pot * 2 + totalCallAmount
    }

    const potSizes = [
      ['Min', table.minRaise],
      ['½ pot', pot * 1/2],
      ['⅔ pot', pot * 2/3],
      ['¾ pot', pot * 3/4],
      ['Pot', pot],
      ['All in', seat.bet + seat.stack]
    ]

    return (
      <Paper className="actions-container">
        <div className="actions">
          <ActionButtons
            seat={seat}
            table={table}
            raiseAmount={this.state.raiseAmount}
            totalCallAmount={totalCallAmount}
            handleFoldClick={() => onFoldClick(table.id)}
            handleCheckClick={() => onCheckClick(table.id)}
            handleCallClick={() => onCallClick(table.id)}
            handleRaiseClick={() => onRaiseClick(table.id, parseFloat(this.state.raiseAmount))}
          />

          {seat.stack > table.callAmount &&
            <div>
              <div>
                <RaiseSlider
                  raiseAmount={this.state.raiseAmount}
                  decreaseRaiseAmount={() => this.handleRaiseUpdate(this.state.raiseAmount - table.minBet)}
                  increaseRaiseAmount={() => this.handleRaiseUpdate(this.state.raiseAmount + table.minBet)}
                  onRaiseChange={this.handleRaiseChange}
                  table={table}
                  seat={seat}
                />
              </div>
              
              <div style={{display: 'flex'}}>
                {potSizes.map(potSize =>
                  <PotSizeButton
                    key={potSize[0]}
                    text={potSize[0]}
                    onRaiseClick={() => this.handleRaiseUpdate(potSize[1])}
                  />
                )}
              </div>
            </div>
          }
        </div>
      </Paper>
    )
  }
}

export default Actions