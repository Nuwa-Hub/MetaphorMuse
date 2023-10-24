import scrapy
import json
from pathlib import Path
import sys

class SinhalaSongBookCrawler(scrapy.Spider):
    name = "SinhalaSongBookCrawler"
    counter = 1

    data = {
        'songs': []
    }

    start_urls = [
        'https://sinhalasongbook.com/all-sinhala-song-lyrics-and-chords/'
    ]

    def writeToJson(self):
        with open("/home/dilan/Private/Education/Semester 7/Data Mining/IR Project/data/original_data.json", 'a', encoding="utf8") as outfile:
            json.dump(self.data, outfile, ensure_ascii=False)

    def parse(self, response):
        for link in response.css("div.pt-cv-ifield ::attr(href)").getall():
            if link is not None:
                yield scrapy.Request(response.urljoin(link), callback = self.parseSong)
        yield scrapy.Request(response.css("ul.pt-cv-pagination ::attr(href)").getall()[-1], self.parse)

    def parseSong(self, response):
        self.counter = self.counter + 1
        self.data['songs'].append({
            'sientitle': response.css("h1.entry-title ::text").getall()[0],
            'artists': response.css("div.su-column-inner span.entry-categories a ::text").getall(),
            'genres': response.css("div.su-column-inner span.entry-tags a ::text").getall(),
            'writer': response.css("div.su-column-inner span.lyrics a ::text").getall(),
            'composer': response.css("div.su-column-inner span.music a ::text").getall(),
            'movies': response.css("div.su-column-inner span.movies a ::text").getall(),
            'keynbeat': response.css("div.entry-content h3 ::text").getall()[0],
            'url': response.url,
            'shares': response.css("div.total_shares span.swp_count ::text").get(),
            'views': response.css("div.tptn_counter ::text").get(),
            'lyrics': response.css("pre ::text").getall()
        })
        print(self.counter)
        print()
        print()
        if (self.counter == 1090):
            print()
            self.writeToJson()
            raise scrapy.exceptions.CloseSpider('Reached Limit')
