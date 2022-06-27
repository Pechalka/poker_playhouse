// @flow
import React from 'react'
import Paper from 'material-ui/Paper'
import { blueGrey, cyan } from 'material-ui/styles/colors'

type Props = {
  seatId: string,
  onSeatClick: () => void
}
const EmptySeat = ({ seatId, onSeatClick, text= 'SIT HERE', amount = 0.0 }: Props) => (
  <Paper onClick={onSeatClick} className="seat-info" style={{ borderRadius: '4px' }}>
    <div className="seat-stack" style={{ background: blueGrey[900] }}>
      {text}
    </div>

    <div>
      <div className="seat-number" style={{ background: cyan[600] }}>{seatId}</div>
      <div className="seat-player" style={{ color: '#ccc', background: cyan[900] }}>${amount}</div>
    </div>
  </Paper>
)

export default EmptySeat
