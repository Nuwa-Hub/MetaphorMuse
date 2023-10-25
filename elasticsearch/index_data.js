"use strict";

require("array.prototype.flatmap").shim();
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://localhost:9200",
});

const prettifiedData = require("../data/formatted_data.json");

async function run() {
  await client.indices.create(
    {
      index: "index_sinhala_poems_v3",
      body: {
        settings: {
          analysis: {
            analyzer: {
              key_analyzer: {
                type: "custom",
                tokenizer: "icu_tokenizer",
                filter: ["customNgramFilter", "customStopWordFilter"],
              },
            },
            filter: {
              customNgramFilter: {
                type: "edge_ngram",
                min_gram: "4",
                max_gram: "18",
                side: "front",
              },
              customStopWordFilter: {
                type: "stop",
                ignore_case: true,
                stopwords: [
                  "ක්",
                  "ලියන",
                  "රචිත",
                  "ලියපු",
                  "ලියව්‌ව",
                  "රූපක",
                  "රූපකය",
                  "ලියන්",
                  "ලිවූ",
                  "වැනි",
                  "සේ",
                  "ඇතුලත්",
                  "ඇතුලු",
                ],
              },
            },
          },
        },
        mappings: {
          properties: {
            poet: {
              type: "text",
              fields: {
                raw: {
                  type: "keyword",
                },
              },
              analyzer: "key_analyzer",
            },
            count: { type: "integer" },
            poemName: {
              type: "text",
              fields: {
                raw: {
                  type: "keyword",
                },
              },
              analyzer: "key_analyzer",
            },
            book: { type: "text" },
            line: { type: "text" },
            year: { type: "text" },
            metaphorPresentOrNot: { type: "text" },
            metorphorTerms: {
              type: "text",
              fields: {
                raw: {
                  type: "keyword",
                },
              },
              analyzer: "key_analyzer",
            },
            sourceDomain: { type: "text" },
            poemNo: { type: "integer" },
            targetDomain: { type: "text" },
            metophorMeaning: { type: "text" },
          },
        },
      },
    },
    { ignore: [400] }
  );

  const dataset = prettifiedData;

  const body = dataset.flatMap((doc) => [
    { index: { _index: "index_sinhala_poems_v3" } },
    doc,
  ]);

  const { body: bulkResponse } = await client.bulk({ refresh: true, body });


  const { body: count } = await client.count({
    index: "index_sinhala_poems_v3",
  });
  console.log(count);
}

run().catch(console.log);
