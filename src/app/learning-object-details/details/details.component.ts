import { LearningObjectService } from './../../learning-object.service';
import { LearningObject } from 'clark-entity';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy {

  private sub: any;
  id: string;
  learningObject: any;

  constructor(
    private learningObjectService: LearningObjectService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    this.fetchLearningObject();
  }
  async fetchLearningObject() {
    this.learningObject = await this.learningObjectService.getLearningObject(this.id);

    console.log(this.learningObject);
  }

  addToCart() {
    this.cartService.addLearningObject(this.id);
  }
  removeFromCart() {
    this.cartService.removeLearningObject(this.id);
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
