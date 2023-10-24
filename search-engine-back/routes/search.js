"use strict";

const express = require("express");
const router = express.Router();

const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://localhost:9200" });

var keywords = require("../../data/keywords.json");
var named_entities = require("../../data/named_entities.json");

router.post("/", async function (req, res) {
  var query = req.body.query;
  var query_words = query.trim().split(" ");
  var removing_query_words = [];
  var size = 100;
  var field_type = "";
  var b_poet = 1;
  var b_poemName = 1;
  var b_book = 1;
  var b_year = 1;
  var b_line = 1;
  var b_metophorMeaning = 1;
  var b_metorphorTerms = 1;
  var b_sourceDomain = 2;
  var b_targetDomain = 1;
  var b_metaphorPresentOrNot = 1;
  var b_count = 1;
  var b_poemNo = 1;
  var metophor = false;
  var b_unformatted_lyrics = 1;
  var sorting = 0;
  var range = 0;
  var sort_method = [];

  if (query_words.length > 8) {
    b_unformatted_lyrics = b_unformatted_lyrics + 2;
    field_type = "best_fields";
  } else {
    field_type = "cross_fields";

    query_words.forEach((word) => {
      word = word.replace("ගේ", "");
      word = word.replace("යන්ගේ", "");

      if (named_entities.artist_names.includes(word)) {
        b_artist = b_artist + 1;
      }
      if (named_entities.writer_names.includes(word)) {
        b_poet = b_poet + 1;
      }
      if (named_entities.composer_names.includes(word)) {
        b_composer = b_composer + 1;
      }
      if (named_entities.genre_names.includes(word)) {
        b_genre = b_genre + 1;
      }
      if (named_entities.movie_names.includes(word)) {
        b_movie = b_movie + 1;
      }

      if (keywords.artist.includes(word)) {
        b_artist = b_artist + 1;
        removing_query_words.push(word);
      }
      if (keywords.composer.includes(word)) {
        b_composer = b_composer + 1;
        removing_query_words.push(word);
      }

      if (keywords.genre.includes(word)) {
        b_genre = b_genre + 1;
        removing_query_words.push(word);
      }
      if (keywords.write.includes(word)) {
        b_poet = b_poet + 1;
        removing_query_words.push(word);
      }
      if (keywords.metorphor.includes(word)) {
        metophor = true;
        removing_query_words.push(word);
  
      }
      if (keywords.poem.includes(word)) {
        removing_query_words.push(word);
      }

      if (keywords.sorting.includes(word)) {
        sorting = sorting + 1;
        removing_query_words.push(word);
      }
      let numbersArray = word.match(/\d+/g);
      if (numbersArray) {
        console.log(word);
        range = parseInt(numbersArray[0]);
        removing_query_words.push(word);
      }
    });
  }
  if (range == 0 && sorting > 0) {
    size = 10;
    sort_method = [{ count: { order: "desc" } }];
  } else if (range > 0 || sorting > 0) {
    size = range;
    sort_method = [{ count: { order: "desc" } }];
  }
  console.log("2", removing_query_words);
  removing_query_words.forEach((word) => {
    query = query.replace(word, "");
  });
  console.log("1", query);

  var result = await client.search({
    index: "index_sinhala_poems",
    body: {
      size: size,
      _source: {
        includes: [
          "metorphorTerms",
          "sourceDomain",
          "targetDomain",
          "line",
          "poet",
          "year",
          "book",
          "poemName",
          "poemNo",
          "metophorMeaning",
          "metaphorPresentOrNot",
          "count",
        ],
      },
      sort: sort_method,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query.trim(),
                fields: [
                  `poet^${b_poet}`,
                  `metorphorTerms^${b_metorphorTerms}`,
                  `sourceDomain^${b_sourceDomain}`,
                  `targetDomain^${b_targetDomain}`,
                  `line^${b_line}`,
                  `poemName^${b_poemName}`,
                  `book^${b_book}`,
                  `year^${b_year}`,
                  `metophorMeaning^${b_metophorMeaning}`,
                ],
                operator: "or",
                type: field_type,
              },
            },
            metophor
              ? {
                  range: {
                    count: {
                      gt: 0,
                    },
                  },
                }
              : {
                  match_all: {},
                },
          ],
        },
      },
      // aggs: {
      //     "genre_filter": {
      //         terms: {
      //             field: "genre.raw",
      //             size: 10
      //         }
      //     },
      //     "composer_filter": {
      //         terms: {
      //             field: "composer.raw",
      //             size: 10
      //         }
      //     },
      //     "artist_filter": {
      //         terms: {
      //             field: "artist.raw",
      //             size: 10
      //         }
      //     },
      //     "writer_filter": {
      //         terms: {
      //             field: "writer.raw",
      //             size: 10
      //         }
      //     }
      // }
    },
  });

  res.send({
    aggs: result.body.aggregations,
    hits: result.body.hits.hits,
  });
});

module.exports = router;
