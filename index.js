if(process.argv.includes('dev')){
    require('dotenv').config()
}

const {
    WHITELIST,
} = process.env;


// setup port
const port = process.env.PORT || 4242

// setup deps
const express = require('express')
const app = express()
const cors = require('cors')
const fileupload = require('express-fileupload')



// setup needed / local APIs
const Router = require('./utils/Router')

// Setup CORS if need be
if(WHITELIST){
    app.use(cors({ origin: WHITELIST }))
}


// Check if uid / container name / storage directory exists
app.post('/check', express.json(), Router.check)


// Get files names for parent uid
app.post('/files', express.json(), Router.getFiles)


// View / Download or from Azure
app.get('/download', express.json(), Router.download)


// Upload to Azure
app.post('/upload', fileupload(), Router.upload)


// LISTEN TO PORT
app.listen(port, (err) => console.info(`
	STARTED ${new Date()}
	Running as ${process.env.isProd ? 'PROD' : 'TEST'}
	Dev: http://127.0.0.1:${port}/
`))