const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite'); /* when loading the database, cheking if process.. has been sent, if so load test.sqlite, I think so */

artistsRouter.param('artistId', (req, res, next, id) => {
    db.get(`SELECT * FROM Artist WHERE Artist.id = $id`, {
        $id: id
    }, (err, artist) => {
        if (err) {
            next(err) /* same thing as below */
        } else if (artist) {
            req.artist = artist;
            next()
        } else {
            res.sendStatus(404)
        }
    });
})

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({ artist: req.artist });
});


artistsRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name; 
    const dateOfBirth = req.body.artist.dateOfBirth;  /* req.body is different from the name I have in the table */
    const biography = req.body.artist.biography;
    const is_currently_employed = req.body.artist.isCurrentlyEmployed === 0 ?  0 : 1;
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, ' + 
    'biography = $biography, is_currently_employed = $is_currently_employed  ' + 
    'WHERE Artist.id = $artistId';
    const values = {
            $name: name,
            $dateOfBirth: dateOfBirth,   
            $biography: biography,
            $is_currently_employed: is_currently_employed,
            $artistId: req.params.artistId
        };
    
        db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = $artist`, {
                $artist: req.params.artistId
            }, (err, artist) => {
                res.status(200).json({ artist : artist });
            }
        )};
    });
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run(`Update Artist SET is_currently_employed = 0 WHERE Artist.id = $artist`, {
        $artist: req.params.artistId
    }, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = $artist`, {
                $artist: req.params.artistId
            }, (err, artist) => {
                res.status(200).json({ artist : artist });
            })
        }
    })
})

artistsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE Artist.is_currently_employed = 1`, (err, artists) => {
        if (err) {
            next(err); /* the err goes directly to the server.js errorhandler function to analyzed */
        } else {
            res.status(200).json({ artists: artists });
        }
    })
})

artistsRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name; 
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const is_currently_employed = req.body.artist.isCurrentlyEmployed === 0 ?  0 : 1;
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) ' +
    'VALUES ($name, $date_of_birth, $biography, $is_currently_employed)';
    const values = {
        $name: name,
        $date_of_birth: dateOfBirth,
        $biography: biography,
        $is_currently_employed: is_currently_employed
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`, (err, artist) => {
                    res.status(201).json({ artist: artist });
                }
            )
        }
    }) 
})




module.exports = artistsRouter;