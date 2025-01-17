import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
// import * as api from '../api'
import axios from 'axios'
import { useSelector } from 'react-redux'

const nickNames = ['dima', 'urban', 'guest', 'datuk'];

const users = [
  {
    position: 1,
    nickname: 'КРАШ KaRaTeL YT',
    score: 123123123123,
    winCount: 99990,      
  },
  {
    position: 2,
    nickname: 'Dima',
    score: 123123123,
    winCount: 50850,      
  },
  {
    position: 3,
    nickname: 'gonzalodelakry',
    score: 616123123,
    winCount: 22850,      
  }
];

for(var i = 4; i <= 150; i++) {
  users.push({
    position: i,
    nickname: nickNames[i % nickNames.length] + i,
    score: 100000 - (2000 + i * 100),
    winCount: 400 - i*3,  
  })
}

const api = {
	getLeaderboard: () => {
		// return new Promise((resolve) => {
		// 	resolve(users);
		// })
		return axios.get('/api/users').then(response => response.data)
	}
}

const periods = [
  {
    text: 'День',
    key: 'day'
  },
  {
    text: 'Неделя',
    key: 'week'
  },
  {
    text: 'Месяц',
    key: 'month'
  },
  {
    text: 'Все время',
    key: 'all'
  },
]

const Leaderboard = () => {

 		const handlyLoadMore = () => {

 		}

  	let navigate = useNavigate();

 		const [data, setData] = useState([])
 		const [isLoading, setIsLoading] = useState(false)
 		const [period, setPeriod] = useState('day')
 		const [total, setTotal] = useState(0)
 		const searchInput = useRef(null);

 		useEffect(() => {
 			setIsLoading(true)
 			api.getLeaderboard().then(users => {
 				setIsLoading(false)
 				setData(users);
 				setTotal(0)
 			})
 		}, [])

 		const handlySearch = (e) => {
 			e.preventDefault();
 			console.log('searchInput ', searchInput.current.value)
 		}

 		const accounts = useSelector((state) => {
 			return state.user.user ? state.user.user.accounts.map(a => a.id) : []
 		});

 		const handleEnter = () => {
 			if (accounts.length > 0) {
	 			navigate('/lobby')
 			} else {
	 			navigate('/login')
 			}
 		}


		const periodComponent = (
	        <div className="period">
	          {periods.map(item => (
	            <div
	              key={item.key}
	              className={`period__item ${period === item.key ? 'period__item--active' : ''}`}
	              onClick={() => setPeriod(item.key)}
	            >{item.text}</div>
	          ))}
	        </div>
      	);

		  return (
		    <div className="leaderboard-container">
		      <div className="user">
		        <h3 className="user__title">Узнай где ты</h3>
		        <p className="user__text">Войти через криптокошелек</p>
		        <button onClick={handleEnter}>Войти</button>
		      </div>
		      <div className="leaderboard">
		        <p className="timer">Обновление через<b>15</b>h<b>54</b>m</p>
		        <h1 className="lheader">Таблица лидеров</h1>
		        <div className="user-search">
		          {isLoading && <span className="user-search__text">ищем игроков...</span>}
		        </div>
		        <form className="search-form" onSubmit={handlySearch}>
		          <input ref={searchInput} className="search-form__input" placeholder='Поиск по игрокам'/>
		          <button className="search-form__button">Найти</button>
		        </form>
		        {periodComponent}
		        <div>
		          <table className="leader-table">
		            <thead>
		              <tr>
		                <th>№</th>
		                <th>Nickname</th>
		                <th>Побед</th>
		                <th>Farming score</th>
		              </tr>
		            </thead>
		            <tbody>
		              {data.map((item, index) => (
		                <tr key={item.nickname} className={accounts.includes(item.id) ? 'leader-table--selected' : ''}>
		                  <td>{index + 1}</td>
		                  <td>{item.nickname}</td>
		                  <td>{item.winCount}</td>
		                  <td>{item.score}</td>
		                </tr>
		               ))}
		            </tbody>
		          </table>
		          {!isLoading && total > data.length && <div className="laod-more">
		            <button onClick={handlyLoadMore} className="laod-more__button">Загрузить еще</button>
		          </div>}
		        </div>
		      </div>
		    </div>
		  )
	}

//   const [data, setLeaderboard] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [total, setTotal] = useState(0);
//   const [period, setPeriod] = useState('day');
//   const [page, setPage] = useState(1);
//   const searchInput = useRef(null);

//   const loadTable = (params) => {
//     setIsLoading(true);
//     api.getLeaderboard(params).then(({ items, total }) => {
//       setLeaderboard(items);
//       setTotal(total);
//       setIsLoading(false)
//     })    
//   }

//   useEffect(() => {
//     loadTable({
//       period,
//       search: searchInput.current.value,
//       page,
//       pageSize: 50,
//     });
//   }, []);


//   const handlySearch = (e) => {
//     e.preventDefault();
//     setPage(1);
//     loadTable({
//       period,
//       search: searchInput.current.value,
//       page: 1,
//       pageSize: 50,
//     });
//   }

//   const handlyLoadMore = () => {
//     setPage(page + 1);

//     setIsLoading(true);
//     // const old = [...data];
//     api.getLeaderboard({
//       period,
//       search: searchInput.current.value,
//       pageSize: 50,
//       page: page + 1,
//     }).then(({ items, total }) => {
//       setLeaderboard((old) => {
//       console.log('items ', [...old, ...items]);

//         return [...old, ...items]
//       });
//       // debugger
//       setTotal(total);
//       setIsLoading(false)
//     }) 
//   }

//   const handlySelectPeriod = (newPeriod) => {
//     // if (isLoading) return;

//     setPage(1);
//     setPeriod(newPeriod);
//     loadTable({
//       period,
//       search: searchInput.current.value,
//       page,
//       pageSize: 50,
//     });
//   }


//   const periodComponent = useMemo(() => {
//       return (
//         <div className="period">
//           {periods.map(item => (
//             <div
//               key={item.key}
//               className={`period__item ${period === item.key ? 'period__item--active' : ''}`}
//               onClick={() => handlySelectPeriod(item.key)}
//             >{item.text}</div>
//           ))}
//         </div>
//       );
//   }, [ period ])

//   console.log('>> ', total , data.length)

//   return (
//     <div>
//       <div className="user">
//         <h3 className="user__title">Узнай где ты</h3>
//         <p className="user__text">Войти через криптокощелек</p>
//         <button>Войти</button>
//       </div>
//       <div className="leaderboard">
//         <p className="timer">Обновление через<b>15</b>h<b>54</b>m</p>
//         <h1 className="header">Таблица лидеров</h1>
//         <div className="user-search">
//           {isLoading && <span className="user-search__text">ищем игроков...</span>}
//         </div>
//         <form className="search-form" onSubmit={handlySearch}>
//           <input ref={searchInput} className="search-form__input" placeholder='Поиск по игрокам'/>
//           <button className="search-form__button">Найти</button>
//         </form>
//         {periodComponent}
//         <div>
//           <table className="leader-table">
//             <thead>
//               <tr>
//                 <th>№</th>
//                 <th>Nickname</th>
//                 <th>Побед</th>
//                 <th>Farming score</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.map(item => (
//                 <tr key={item.nickname}>
//                   <td>{item.position}</td>
//                   <td>{item.nickname}</td>
//                   <td>{item.winCount}</td>
//                   <td>{item.score}</td>
//                 </tr>
//                ))}
//             </tbody>
//           </table>
//           {!isLoading && total > data.length && <div className="laod-more">
//             <button onClick={handlyLoadMore} className="laod-more__button">Загрузить еще</button>
//           </div>}
//         </div>
//       </div>
//     </div>
//   )
// }

export default Leaderboard;