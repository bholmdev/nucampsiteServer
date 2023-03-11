const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.route("/")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate("user")
    .populate("campsites")
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
    })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        console.log(``);
        if (!favorite) {

        } else {

        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
})

favoriteRouter.route("/:campsiteId")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
})