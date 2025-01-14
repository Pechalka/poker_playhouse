// @flow
import React from 'react'
import SeatedPlayer from './SeatedPlayer'
import EmptySeat from './EmptySeat'

type Props = {
  user: {
    id: number,
    username: string,
  },
  table: {
    id: number,
    seats: {
      [seatId: any]: ?{
        id: number,
        player: {
          name: string,
        },
        hand: Array<{
          rank: string,
          suit: string,
        }>,
        bet: number,
        stack: number,
      },
    },
    maxPlayers: number,
  },
  onSeatClick: (tableId: number, seatId: number) => void,
  displayOffset: number,
}
class Seats extends React.Component<Props> {
  render() {
    const { user, table, onSeatClick, displayOffset } = this.props
    let seats = Object.keys(table.seats)
    //[1, 2, 3, 4, 5, 6, 7, 8, 9]
    //Object.keys(table.seats)
    const seatedPlayerIds = seats.map(seatId => table.seats[seatId] && table.seats[seatId].id);
    const seated = seatedPlayerIds.includes(user.id);

    return (
      <div>
        {seats.map(seatId => {

          const seat = table.seats[seatId]
          {/*{ 
            turn: false, id: seatId, player: { name : 'sdfsdf'},
            hand: [],
            bet: 1,
            stack: 10,
          };*/}
          //table.seats[seatId]
          const isButton = parseInt(seatId) === table.button ? true : false
          //false;
          // parseInt(seatId) === table.button ? true : false

          let displayOrder
          if (parseInt(seatId) + displayOffset > table.maxPlayers) {
            displayOrder = parseInt(seatId) + displayOffset - table.maxPlayers
          } else {
            displayOrder = parseInt(seatId) + displayOffset
          }

          let className = `seat-container seat${displayOrder}of${table.maxPlayers}`
          if (seat && seat.turn) {
            className += ' active'
          }

          if (seat) {
            return (
              <div key={seatId} className={className}>
                <SeatedPlayer
                  user={user}
                  seat={seat}
                  isButton={isButton}
                />
              </div>
            )
          } else if (!seated) {
            return (
              <div key={seatId} className={className}>
                <EmptySeat
                  seatId={seatId}
                  onSeatClick={e => {
                    if (e) e.stopPropagation()
                    onSeatClick(table.id, parseInt(seatId))
                }}/>
              </div>
            )
          } else {
            {
              {/*return <div key={seatId}></div>*/}
              return (
                <div key={seatId} className={className}>
                  <EmptySeat
                    text='waiting...'
                    seatId={seatId}
                    amount={1500}
                    // onSeatClick={e => {
                    //   if (e) e.stopPropagation()
                    //   onSeatClick(table.id, parseInt(seatId))
                    // }}
                  />
                </div>
              )
            }
            {/*return <div key={seatId} className={className}>
              <SeatedPlayer
                  user={{ name: 'empty' }}
                  seat={{ 
                    turn: false, id: seatId, player: { name : 'no player'},
                    hand: [],
                    bet: 1500,
                    stack: 0,
                  }}
                  isButton={false}
                />
            </div>*/}
          }
        })}
      </div>
    )
  }
}

export default Seats
