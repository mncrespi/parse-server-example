const express = require('express')
const path = require('path')
const ParseServer = require('parse-server').ParseServer
const ParseDashboard = require('parse-dashboard')
const ParseDashboardUsers = require('./dashboard-users')

const {
  NODE_ENV,
  SERVER_HOST,
  SERVER_PORT,
  APP_ID,
  MASTER_KEY,
  DATABASE_URI,
  APP_NAME,
  ICON_NAME,
} = process.env


if (!DATABASE_URI)
  throw new Error('DATABASE_URI not specified')

const api = new ParseServer({
  databaseURI: DATABASE_URI,
  cloud: `${__dirname}/cloud/main.js`,
  appId: APP_ID,
  masterKey: MASTER_KEY,
  serverURL: `${SERVER_HOST}:${SERVER_PORT}/parse`,
  liveQuery: {
    classNames: [
      'Posts',
      'Comments',
    ]
  }
})
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey



// const dashboard = new ParseDashboard({
// 	// Parse Dashboard settings
// }, options);

const dashboard = new ParseDashboard({
    apps: [{
      serverURL: '/parse',
      appId: APP_ID,
      masterKey: MASTER_KEY,
      appName: APP_NAME,
      iconName: ICON_NAME,
      supportedPushLocales: [ 'es', ],
      // primaryBackgroundColor: '#FFA500', // Orange
      // secondaryBackgroundColor: '#FF4500', // OrangeRed
    }],
    users: ParseDashboardUsers,
    useEncryptedPasswords: true,
    iconsFolder: path.join(__dirname, '/icons'),
  }, 
  {
    allowInsecureHTTP: true, 
  },
)


const app = express()


// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')))

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api)

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', (req, res) => {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!')
})

// Only on Dev, there will be a test page available on the /test path of your server url
if (NODE_ENV === 'production')
  app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/test.html'))
  })

const httpServer = require('http').createServer(app)
httpServer.listen(SERVER_PORT, () => {
  console.log(`${APP_ID} running on port ${SERVER_PORT} (${NODE_ENV}).`)
})

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer)
