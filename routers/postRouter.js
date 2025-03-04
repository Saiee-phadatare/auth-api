const express = require("express");
const { identifier } = require("../middlewares/identification");
const { getpost, getSinglePost, createPost, updatePost, deletePost} = require('../controllers/postController');

const router = express.Router();

router.get("/all-posts", getpost);
router.get("/single-post", getSinglePost);

router.post('/create', identifier, createPost);

router.put('/update', identifier, updatePost );

router.delete('/delete', identifier, deletePost)

module.exports = router;