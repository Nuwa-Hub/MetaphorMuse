import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-poem',
  templateUrl: './poem.component.html',
  styleUrls: ['./poem.component.css']
})
export class PoemComponent implements OnInit {

  @Input() result: any[];
  isClicked = false;

  constructor() { }

  ngOnInit() {
  }

  clicked() {
    this.isClicked = !this.isClicked;
    console.log(this.result)
  }

}
