
const { Storage } = require('./../API/Azure')


module.exports = {
    check,
    download,
    upload,
    getFiles,
}


/**
 * pass to storage provider to stream back file to user
 * @param {Object} req - the request from the user
 * @param {Object} res - the response object to use
 */
async function download (req, res) {
    
    const { uid, name, index } = req.query

    Storage.download(uid, name, index, res)
}


/**
 * pass to storage provider to upload file for user
 * @param {Object} req - the request from the user
 * @param {Object} res - the response object to use
 */
async function upload (req, res) {

    const { uid } = req.body
    
    await Storage.containerCheck(uid)

    try {
            
        if (Object.keys(req.files).length == 0) {
            return res.status(400).send('No files were uploaded.').end()
        }
    
        const { file } = req.files

        const result = await Storage.uploadFile(file, uid)
        
        res.end(result)

    }
    catch (error) {
        console.log('UPLOAD ERROR ')
        console.error(error)
    }
}


/**
 * pass to storage provider to get file name for a particular UID / container name / bucket name
 * @param {Object} req - the request from the user
 * @param {Object} res - the response object to use
 */
async function getFiles (req, res) {

    try {

        const { uid } = req.body
            
        const names = await Storage.getFileNames(uid)
        
        res.send( { names } )
    }
    catch(e){
        console.log(e)
        res.send({ error: e })
    }
}


/**
 * check if a container exists
 * @param {Object} req - the request from the user
 * @param {Object} res - the response object to use
 */
async function check (req, res) {

    const { uid } = req.body
    
    if(!uid){ return res.status(422).end('undefined uid') }

    try {
            
        const result = await Storage.containerCheck(uid)

        res.end( result )
    }
    catch(error){
        res.end(error)
    }
}


