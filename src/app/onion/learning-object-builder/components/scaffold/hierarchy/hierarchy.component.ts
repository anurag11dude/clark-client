import { Component, OnInit, Input} from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-hierarchy',
  templateUrl: './hierarchy.component.html',
  styleUrls: ['./hierarchy.component.scss']
})
export class HierarchyComponent implements OnInit {
  @Input() editContent: boolean; 
  @Input() learningObject: LearningObject; 
  constructor() { }

  ngOnInit() {
  }

}
