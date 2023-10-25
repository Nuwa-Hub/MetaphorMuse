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
  var size = 200;
  var field_type = "";
  var weight_poet = 1;
  var weight_poemName = 1;
  var weight_book = 1;
  var weight_year = 1;
  var weight_line = 1;
  var weight_metophorMeaning = 1;
  var weight_metorphorTerms = 1;
  var weight_sourceDomain = 1;
  var weight_targetDomain = 1;
  var metophorOnly = false;
  var range = 0;
  var sort_method = [];

  if (query_words.length > 8) {
    field_type = "best_fields";
  } else {
    field_type = "cross_fields";

    query_words.forEach((word) => {
      word = word.replace("ගේ", "");
      word = word.replace("යන්ගේ", "");

      if (named_entities.writer_names.includes(word)) {
        weight_poet = weight_poet + 1;
      }
      if (keywords.write.includes(word)) {
        weight_poet = weight_poet + 1;
        removing_query_words.push(word);
      }
      if (keywords.metorphor.includes(word)) {
        metophorOnly = true;
        weight_sourceDomain = weight_sourceDomain + 2;
        weight_targetDomain = weight_targetDomain + 2;
        
        removing_query_words.push(word);
      }
      if (keywords.meaning.includes(word)) {
        weight_metophorMeaning = weight_metophorMeaning + 1;
        removing_query_words.push(word);
      }
      if (keywords.poem.includes(word)) {
        removing_query_words.push(word);
      }
      let numbersArray = word.match(/\d+/g);
      if (numbersArray) {
        range = parseInt(numbersArray[0]);
        removing_query_words.push(word);
      }
    });
  }

  if (range == 0) {
    size = 100;
  } else if (range > 0) {
    size = range;
  }
  if (metophorOnly) {
    sort_method = [{ count: { order: "desc" } }];
  }
  console.log("2", removing_query_words);
  removing_query_words.forEach((word) => {
    query = query.replace(word, "");
  });


  var result = await client.search({
    index: "index_sinhala_poems_v3",
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
                  `poet^${weight_poet}`,
                  `metorphorTerms^${weight_metorphorTerms}`,
                  `sourceDomain^${weight_sourceDomain}`,
                  `targetDomain^${weight_targetDomain}`,
                  `line^${weight_line}`,
                  `poemName^${weight_poemName}`,
                  `book^${weight_book}`,
                  `year^${weight_year}`,
                  `metophorMeaning^${weight_metophorMeaning}`,
                ],
                operator: "or",
                type: field_type,
              },
            },
            metophorOnly
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
        aggs: {
          "poet_filter": {
              terms: {
                  field: "poet.raw",
                  size: 10
              }
          },
          "metorphorTerms_filter": {
              terms: {
                  field: "metorphorTerms.raw",
                  size: 10
              }
          },
          "poemName_filter": {
            terms: {
                field: "poemName.raw",
                size: 10
            }
        },
        }
    
    },
  });

  res.send({
    aggs: result.body.aggregations,
    hits: result.body.hits.hits,
  });
});

module.exports = router;
