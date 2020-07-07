const express = require('express');
const issuesRouter = express.Router({mergeParams: true}); /* since I need to access information about the series from the issue router
basically I'll have access the seriesId parameters */
const sqlite3 = require('sqlite3');

const db =  new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, id) => { /* checking issueId */
    db.get('SELECT * FROM Issue WHERE Issue.id = $id', {
        $id: id
    }, (err, issue) => {
        if (err) {
            next(err)
        } else if (issue) {
            next()
        } else {
            res.sendStatus(404) /* 404 Not Found. The server can not find requested resource. */
        }
    });
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $id';
    const artistID = { $id: artistId }
    db.get(artistSql, artistID, (err, artist) => {
        if (err) {
            next(err);
        } else {
            if (!name || !issueNumber || !publicationDate || !artist) {
            return res.sendStatus(400) /* Bad Request, The server cannot or will not process the request due to an apparent client error */
        }
        db.run('UPDATE Issue SET name = $name, issue_number = $issueNumber, ' +
        'publication_date = $publicationDate, artist_id = $artistId ' +
        'WHERE Issue.id = $id', {
            $name: name,
            $issueNumber: issueNumber,
            $publicationDate: publicationDate,
            $artistId: artistId,
            $id: req.params.issueId
        }, err => {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`, (err, issue) => {
                    res.status(200).json({issue: issue}) /* OK Request */
                })
            }
        })
        }
    })
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE Issue.id = ${req.params.issueId}`, err => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204) /* succesful delition */
        }
    })
})


issuesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Issue WHERE Issue.series_id = $seriesId', {
        $seriesId: req.params.seriesId
    }, (err, issues) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ issues: issues}) /* Standard response for successful HTTP requests */
        }
    })
})

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $id';
    const artistID = { $id: artistId }
    db.get(artistSql, artistID, (err, artist) => {
        if (err) {
            next(err);
        } else {
            if (!name || !issueNumber || !publicationDate || !artist) {
            return res.sendStatus(400) /* Bad Request, The server cannot or will not process the request due to an apparent client error */
        }
        db.run('INSERT INTO Issue(name, issue_number, publication_date, artist_id, series_id) ' +
        'VALUES($name, $issueNumber, $publicationDate, $artistId, $seriesId)', {
            $name: name,
            $issueNumber: issueNumber,
            $publicationDate: publicationDate,
            $artistId: artistId,
            $seriesId: req.params.seriesId
        }, function(err) {
            if (err) {
                next(err)
            } else {
                db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, (err, issue) => {
                res.status(201).json({ issue: issue }) /* The request has been fulfilled, resulting in the creation of a new resource */
                })
            }
        })
    }})
})


module.exports = issuesRouter
