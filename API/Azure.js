const { ACCOUNT, ACCOUNT_KEY } = process.env

const {
	Aborter,
	BlobURL,
	BlockBlobURL,
	ContainerURL,
	ServiceURL,
	StorageURL,
	SharedKeyCredential,
	AnonymousCredential,
	uploadFileToBlockBlob,
	uploadStreamToBlockBlob,
	TokenCredential
} = require("@azure/storage-blob");



const Storage = {
	
	getServiceURL: container => {
		
		const sharedKeyCredential = new SharedKeyCredential(ACCOUNT, ACCOUNT_KEY);

		const pipeline = StorageURL.newPipeline(sharedKeyCredential)

		const serviceURL = new ServiceURL(
			container 
				? `https://${ACCOUNT}.blob.core.windows.net/${container}` 
				: `https://${ACCOUNT}.blob.core.windows.net`,
			pipeline
		)

		return serviceURL
	},

	getContainerURL: container => {

		const serviceURL = Storage.getServiceURL()

		const containerURL = ContainerURL.fromServiceURL(serviceURL, container)

		return containerURL
	},

	listContainers: () => {

		async function action(resolve, reject){

			try {
				
				const serviceURL = Storage.getServiceURL()

				const contains = await serviceURL.listContainersSegment( Aborter.none )
		
				resolve(contains)
			}
			catch(e){
				reject(e)
			}
		}

		return new Promise(action)
	},

	getFileNames: uid => {
		
		async function action(resolve, reject){

			const containerURL = await Storage.getContainerURL(uid)

			let marker = undefined, list = [];
			
			do {

				const listBlobsResponse = await containerURL.listBlobFlatSegment(
					Aborter.none,
					marker
				)

				marker = listBlobsResponse.nextMarker

				for (const blob of listBlobsResponse.segment.blobItems) {
					list.push(blob.name)
				}
			} while (marker)

			resolve( list )
		}

		return new Promise(action)
	},

	uploadFile: (document, uid) => {
		
		//console.log(`\n\n/upload hit => ${document.name}\n\n`)
		
		const containerURL = Storage.getContainerURL(uid)

		async function action(resolve){

			const blobURL = BlobURL.fromContainerURL(containerURL, document.name)
			const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL)
			
			await blockBlobURL.upload(
				Aborter.none,
				document.data,
				document.data.length
			)

			resolve(`Uploaded ${document.name} successfully`)
		}

		return new Promise(action)
	},
	
	containerCheck: name => {
		
		console.log(`CONTAINER CHECK: ${name}`)
		
		async function action(resolve, reject){

			const serviceURL = Storage.getServiceURL()

			const containerURL = ContainerURL.fromServiceURL(serviceURL, name)

			try {
				const createContainerResponse = await containerURL.create(Aborter.none)
				resolve(`Create container ${name} successfully: ${createContainerResponse.requestId}`)
			}
			catch(e){
				reject(e.body)
			}
		}

		return new Promise(action)
	},
	
	download: (uid, name, index, res) => {
		
		(async () => {

			try {
				
				const containerURL = Storage.getContainerURL(uid)


				const blobURL = BlobURL.fromContainerURL(containerURL, name);


				const downloadBlockBlobResponse = await blobURL.download(Aborter.none, 0);
				

				downloadBlockBlobResponse.readableStreamBody.pipe( res )
			}
			catch(e){
				console.log('CATCH ')
				console.dir(e)
				res.send(e)
			}
		})();
	}
}


module.exports = { Storage }