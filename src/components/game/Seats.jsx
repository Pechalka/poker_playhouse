import React from 'react'
import SeatedPlayer from './SeatedPlayer'

class Seats extends React.Component {
  render() {
    const { player, table, onSeatClick } = this.props

    return (
      <div>
        {Object.keys(table.seats).map((seatId) => {
          const seat = table.seats[seatId]
          const isButton = parseInt(seatId) === parseInt(table.button) ? true : false
          
          if (seat) {
            return (
              <SeatedPlayer
                key={seatId}
                player={player}
                seat={seat}
                isButton={isButton}
              />
            )
          } else {
            return (
              <div
                key={seatId}
                className="seat"
                onClick={() => { onSeatClick(table.id, seatId) }}
              >
                <span className="seat-number">{seatId}</span>
                <span>SIT HERE</span>
              </div>
            )
          }
        })}
      </div>
    )
  }
}

export default Seats
