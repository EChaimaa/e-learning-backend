const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Image = require("../models/image");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/' + file.fieldname)
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
});

var upload = multer({ storage: storage });


const cpUpload = upload.fields([{ name: 'images', maxCount: 1 }, { name: 'videos', maxCount: 1 }]);

router.post('/upload', cpUpload, async (req, res, next) => {

    const files = req.files
    if (!files || files.images.length === 0 || files.videos.length === 0) {
        const error = new Error('Certains fichers manquent, veuillez réessayer')
        error.httpStatusCode = 400
        return next(error)
    }

    const image = req.files.images[0].path.replace(/\\/g, "/");
    const video = req.files.videos[0].path.replace(/\\/g, "/");

    const {
        email,
        title,
        description,
        paragraphs,
        quiz,
        categoryId,
    } = req.body;

    const quizToSave = JSON.parse(quiz);
    quizToSave.map((q) => {
        q.uniqueChoice = JSON.parse(q.uniqueChoice);
        q.beginTime = parseInt(q.beginTime);
        q.endTime = parseInt(q.endTime);
        q.responses = [];
        q.choices = JSON.parse(q.choices).map(choice => ({
            order: parseInt(choice.order),
            text: choice.text,
            correct: JSON.parse(choice.correct),
        }));
    });


    console.log(email, title, description, paragraphs, categoryId, quizToSave);

    // we replace all \ with /
    // const imagepost = new Image({
    //     image: file.path.replace(/\\/g, "/"),
    // })
    // const savedimage = await imagepost.save()
    // res.json(savedimage)
    res.send(image);

});

router.get('/image', async (req, res) => {
    const image = await Image.find()
    res.json(image)

});

module.exports = router;