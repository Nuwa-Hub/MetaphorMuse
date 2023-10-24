import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @Output() resultEvent: EventEmitter<any> = new EventEmitter();
  aggregations: any[];
  hits: any[];

  query: string;
  searched: boolean;

  constructor(private searchService: SearchService) { }

  ngOnInit() {
  }

  search() {
    this.searchService.search(this.query).subscribe((result: {hits, aggs}) => {
      this.resultEvent.emit(result.hits);
      this.aggregations = result.aggs;
      this.hits = result.hits;
      this.searched = true;
      console.log(result)
    });
  }

  clear() {
    this.query = '';
    this.resultEvent.emit([]);
    this.searched = false;
  }

  filterByArtist(key) {
    const newArr = [];
    this.hits.forEach(hit => {
      if (hit._source.artist) {
        hit._source.artist.forEach(artist => {
          if (artist === key) {
            newArr.push(hit);
          }
        });
      }
    });
    this.resultEvent.emit(newArr);
  }

  filterByMusic(key) {
    const newArr = [];
    this.hits.forEach(hit => {
      if (hit._source.composer) {
        hit._source.artist.forEach(composer => {
          if (composer === key) {
            newArr.push(hit);
          }
        });
      }
    });
    this.resultEvent.emit(newArr);
  }

  filterByComposer(key) {
    const newArr = [];
    this.hits.forEach(hit => {
      if (hit._source.writer) {
        hit._source.writer.forEach(writer => {
          if (writer === key) {
            newArr.push(hit);
          }
        });
      }
    });
    this.resultEvent.emit(newArr);
  }

  filterByGenre(key) {
    const newArr = [];
    this.hits.forEach(hit => {
      if (hit._source.genre) {
        hit._source.genre.forEach(genre => {
          if (genre === key) {
            newArr.push(hit);
          }
        });
      }
    });
    this.resultEvent.emit(newArr);
  }

  // filter(key, count) {
  //   this.query = key + ' ' + this.query + ' ' + count;
  //   this.search();
  // }

}
