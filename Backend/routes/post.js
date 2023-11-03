const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// TODO - Develop the routes for CRUD operations on posts

router.get("/cretenewpost", (req, res)=>{
    res.send("This is the router for creating a new post");
})

module.exports = router;