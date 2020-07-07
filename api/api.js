const express = require('express')
const apiRouter = express.Router();
const artistsRouter = require('./artists');
const seriesRouter = require('./series')

module.exports = apiRouter;

apiRouter.use('/artists', artistsRouter)
apiRouter.use('/series', seriesRouter)