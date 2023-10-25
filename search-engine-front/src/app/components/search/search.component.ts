import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { SearchService } from "src/app/services/search.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.css"],
})
export class SearchComponent implements OnInit {
  @Output() resultEvent: EventEmitter<any> = new EventEmitter();
  aggregations: any[];
  hits: any[];

  query: string;
  searched: boolean;

  constructor(private searchService: SearchService) {}

  ngOnInit() {}

  search() {
    this.searchService
      .search(this.query)
      .subscribe((result: { hits; aggs }) => {
        this.resultEvent.emit(result.hits);
        this.aggregations = result.aggs;
        this.hits = result.hits;
        this.searched = true;
      });
  }

  clear() {
    this.query = "";
    this.resultEvent.emit([]);
    this.searched = false;
  }

  filterByArtist(key) {
    const newArr = [];
    console.log(this.hits);
    this.hits.forEach((hit) => {
      if (hit._source.poet && Array.isArray(hit._source.poet)) {
        console.log(hit._source.poet);
        hit._source.poet.forEach((artist) => {
          if (artist === key) {
            newArr.push(hit);
          }
        });
      }
    });
    console.log(newArr);
    this.resultEvent.emit(newArr);
  }

  filterByMetorphorTerms(key) {
    console.log(key);
    const newArr = [];
    this.hits.forEach((hit) => {
      if (hit._source.metorphorTerms) {
        hit._source.metorphorTerms.forEach((metorphorTerm) => {
          if (metorphorTerm === key) {
            newArr.push(hit);
          }
        });
      }
    });
    this.resultEvent.emit(newArr);
  }

  filterByPoemName(key) {
    console.log(key);
    const newArr = [];
    this.hits.forEach((hit) => {
      if (hit._source.poemName) {
        if (hit._source.poemName === key) {
          newArr.push(hit);
        }
      }
    });
    this.resultEvent.emit(newArr);
  }
  // filter(key, count) {
  //   this.query = key + ' ' + this.query + ' ' + count;
  //   this.search();
  // }
}
