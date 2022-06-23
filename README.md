# poker_playhouse
Realtime multiplayer poker  
Node.js, React, Redux, Socket.IO, Express, Sequelize, PostgreSQL



JWT_SECRET=test PORT=8000 NODE_ENV=development yarn start


weback +
JWT_SECRET=test PORT=8000 NODE_ENV=production yarn start

### Configure cronjob
use `which node` in sh for resolve actual node path
and put to cronjob smth like 
> 0 0 * * * /usr/bin/node /srv/poker_playhouse/server/command/renewAccountTicketsCommand.js > /var/log/cronrun.log

### for example

> 0 0 * * *  /home/zempheroth/.nvm/versions/node/v12.22.12/bin/node /var/www/total-poker/server/command/renewAccountTicketsCommand.js

