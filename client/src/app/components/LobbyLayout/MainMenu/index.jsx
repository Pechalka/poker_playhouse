// @flow
import * as React from 'react'
import { css } from 'emotion'

import TableList from './TableList'
import PlayerList from './PlayerList'
import { Button } from '../../../../components'

import { Panel } from '../../../../components';

const tableList = css`
  text-align: center;
  font-size: 16px;
  border-spacing: 0 5px;
`
const tableHeader = css`
  padding-bottom: 10px;
  font-weight: 600;
  font-size: 20px;
`

const styles = {
  tab: css`
    font-size: 20px;
    margin-right: 30px;
    transition: 100ms ease;

    &:hover {
      cursor: pointer;
      color: #2196f3;    
      border-bottom: 2px solid #2196f3;    
    }
  `,
  activeTab: css`
    font-size: 20px;
    margin-right: 30px;   
    color: #2196f3;
    border-bottom: 2px solid #2196f3;
    font-weight: 600;
  `,
  container: css`
    max-width: 525px;
    margin: 200px auto 0;
  `,
}

type Props = {
  user: {
    id: number,
    username: string,
    bankroll: number,
  },
  logout: () => void,
  openTables: {},
  tables: {},
  handleTableClick: (tableId: number) => void,
  players: {
    [socketId: string]: ?{
      id: number,
      name: string,
      bankroll: number,
    },
  },
}
type State = {
  activeTab: 'free' | 'playToEarn' | 'PvP',
}

class MainMenu extends React.Component<Props, State> {
  state = {
    activeTab: 'free'
  }

  selectPlayToEarn() {
    if (!this.props.account) {
      alert('Please select account for play')      
    } else {
      this.setState({ activeTab: 'playToEarn' })
    }
  }

  selectPvP() {
    if (!this.props.account) {
      alert('Please select account for play')      
    } else {
      if (this.props.account.level < 10) {
        alert('account level should be more than 10')        
      } else {
        this.setState({ activeTab: 'PvP' })        
      }
    }
  }

  renderTabs() {
    const { activeTab } = this.state
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div>
          <span
            className={activeTab === 'free' ? styles.activeTab : styles.tab}
            onClick={() => this.setState({ activeTab: 'free' })}>
            Free
          </span>
          <span
            className={activeTab === 'playToEarn' ? styles.activeTab : styles.tab}        
            onClick={() => this.selectPlayToEarn()} >
            play to earn
          </span>
          <span
            className={activeTab === 'PvP' ? styles.activeTab : styles.tab}        
            onClick={() => this.selectPvP()}>
            PvP
          </span>
        </div>
      </div>
    )
  }

  render() {
    const {
      user,
      openTables,
      tables,
      handleTableClick,
      players,
      account,
      hadleSiteToPlay,
    } = this.props

    // const activePlayers = React.useMemo(() => {
    //   // if (Object.keys(openTables).length > 0) {
    //   //   tables[openTables[]]
    //   // }


    //   return [];
    // }, [tables, openTables])

    const activePlayers = (function(){
      if (Object.keys(openTables).length > 0) {
        const tableId = +Object.keys(openTables)[0]

        return tables[tableId].players.map(p => p.name)
      }
       return [];
    })()


    if (!user) return null;
    const hasTableOpen = Object.keys(openTables).length > 0
    const userPlayer = Object.values(players).find(player =>
      player && player.id && player.id === user.id
    )
    if (!userPlayer) return null;

    const tablesByType = Object.entries(tables).map(item => item[1]).reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = { [item.id]: item };
      else acc[item.type] = { ...acc[item.type], [item.id]: item };

      return acc;
    }, {})

    console.log('tables ', tables, Object.keys(openTables));




    return (
      <div>
        <div className={styles.container}>
          {/*{this.renderTabs()}*/}
          {/*{this.state.activeTab === 'free' &&
            <TableList
            tables={tablesByType.free}
            onTableClick={handleTableClick}
            openTables={Object.keys(openTables)}
            hasTableOpen={hasTableOpen}
            />
          }
          {this.state.activeTab === 'playToEarn' &&
            <TableList
            tables={tablesByType.playToEarn}
            onTableClick={handleTableClick}
            openTables={Object.keys(openTables)}
            hasTableOpen={hasTableOpen}
            />
          }
          {this.state.activeTab === 'PvP' &&
            <TableList
            tables={tablesByType.PvP}
            onTableClick={handleTableClick}
            openTables={Object.keys(openTables)}
            hasTableOpen={hasTableOpen}
            />
          }*/}
          {!hasTableOpen && <Button disabled={!account} onClick={hadleSiteToPlay}>site to play</Button>}

          {hasTableOpen && <Panel header={`Waiting players (${activePlayers.length}/2) ...`}>
            <table className={tableList}>
              <thead>
                <tr>
                  <th className={tableHeader}>Name</th>
                </tr>
              </thead>
              <tbody>
                {activePlayers.map(player => (
                  <tr key={player}>
                    <td>{player}</td>
                  </tr>
                 ))}                
              </tbody>
            </table>
          </Panel>}
          

        </div>
      </div>
    )
  }
}

export default MainMenu;