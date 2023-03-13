const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Campsite = require("../models/campsite");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    const { _id } = req.user;
    Favorite.find({ _id })
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ request: "successful", favorites });
      })
      .catch((err) => {
        res.statusCode = 500;
        next(err);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { _id } = req.user;
    Favorite.findOne({ user: _id })
      .then((favorite) => {
        if (favorite) {
          for (let i = 0; i < req.body.length; i++) {
            if (!favorite.campsites.includes(req.body[i]._id)) {
              favorite.campsites.push(req.body[i]._id);
            }
          }
          favorite.save();
        } else {
          Favorite.create({
            user: _id,
            campsites: req.body,
          })
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ request: "successful", favorite });
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        const error = new Error("Internal error");
        res.statusCode = 500;
        next(err);
      });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    const err = new Error(`PUT operation is not supported on favorites/`);
    next(err);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { _id } = req.user;
    Favorite.findOneAndDelete({ user: _id })
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => {
        res.setHeader("Content-Type", "text/plain");
        res.end("You do not have any favorites to delete");
      });
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    const err = new Error(
      `GET operation is not supported on favorites/${req.params.campsiteId}`
    );
    next(err);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { _id } = req.user;
    const { campsiteId } = req.params;
    Favorite.findOne({ user: _id }).then((favorite) => {
      Campsite.find({ _id: campsiteId })
        .then((campsite) => {
          if (campsite.length > 0) {
            console.log(campsite);
            if (!favorite) {
              Favorite.create({
                user: _id,
                campsites: [campsiteId],
              })
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json({ request: "successful", favorite });
                })
                .catch((err) => {
                  next(err);
                });
            } else {
              if (!favorite.campsites.includes(campsiteId)) {
                favorite.campsites.push(campsiteId);
                favorite.save();
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json({
                  message: "successfully added campsite to favorites",
                });
              } else {
                res.setHeader("Content-Type", "text/plain");
                res.end("This campsite is already a favorite");
              }
            }
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("Not a valid campsite");
          }
        })
        .catch((err) => {
          next(err);
        });
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    const err = new Error(
      `PUT operation is not supported on favorites/${req.params.campsiteId}`
    );
    next(err);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { _id } = req.user;
    const { campsiteId } = req.params;
    Favorite.findOne({ user: _id }).then((favorite) => {
      if (!favorite) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/plain");
        res.end("No favorite document exists for deletion");
      } else {
        const updatedFavorites = favorite.campsites.filter(
          (campId) => campId != campsiteId
        );
        favorite.campsites = updatedFavorites;
        favorite.save().then((doc) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(doc);
        });
      }
    });
  });

module.exports = favoriteRouter;