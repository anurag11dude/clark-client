import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningOutcome } from '@cyber4all/clark-entity';
import {
  BuilderStore,
  BUILDER_ACTIONS as actions
} from '../../builder-store.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { LearningObjectValidator } from '../../validators/learning-object.validator';

@Component({
  selector: 'clark-outcome-page',
  templateUrl: './outcome-page.component.html',
  styleUrls: ['./outcome-page.component.scss']
})
export class OutcomePageComponent implements OnInit, OnDestroy {
  private _outcomes: Map<string, LearningOutcome> = new Map();
  destroyed$: Subject<void> = new Subject();

  // flags
  activeOutcome: string;
  // passed outcome id from query params
  passedId: string;

  constructor(
    private store: BuilderStore,
    private validator: LearningObjectValidator,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // subscribe to params from activated route
    this.route.paramMap.takeUntil(this.destroyed$).subscribe(params => {
      this.passedId = params.get('id');
      this.setActiveOutcome(this.passedId);
    });

    // listen for outcome events and update component store
    this.store.outcomeEvent
      .pipe(takeUntil(this.destroyed$))
      .subscribe((payload: Map<string, LearningOutcome>) => {
        if (payload) {
          if (!payload.get(this.activeOutcome)) {
            // the active outcome had a temp id but has been saved and assigned a new id
            const arr = Array.from(payload.values());

            // we need to fine the outcome in the new array that has the tempId property that matches the current activeOutcome value
            for (let i = 0, l = arr.length; i < l; i++) {
              const o = arr[i];

              if (o.tempId && o.tempId === this.activeOutcome) {
                // this is the same outcome as the active outcome, reset the activeOutcome id
                this.activeOutcome = o.id;
                break;
              }
            }
          }

          // now reset our outcomes map
          this.outcomes = payload;
        }
      });
  }

  /**
   * Retrieve Map version of outcomes
   *
   * @memberof OutcomePageComponent
   */
  get outcomes() {
    return this._outcomes;
  }

  /**
   * Retrieve iterable-version of outcomes
   *
   * @readonly
   * @memberof OutcomePageComponent
   */
  get iterableOutcomes() {
    return Array.from(this._outcomes.values());
  }

  /**
   * Set component stored outcomes map and create iterable array
   *
   * @memberof OutcomePageComponent
   */
  set outcomes(outcomes: Map<string, LearningOutcome>) {
    this._outcomes = outcomes;
    if (outcomes.size && !this.activeOutcome) {
      this.activeOutcome = outcomes.values().next().value.id;
    }
  }

  setActiveOutcome(id: string) {
    if (id !== this.activeOutcome) {
      this.store.sendOutcomeCache();
      this.activeOutcome = id;
    }
  }

  mutateOutcome(id: string, params: any) {
    this.store.execute(actions.MUTATE_OUTCOME, { id, params }).then((outcome: LearningOutcome) => {
      this.validator.validateOutcome(outcome);
    });
  }

  newOutcome() {
    this.store.execute(actions.CREATE_OUTCOME, {}).then(id => {
      // TODO remove this
      const outcome = this.store.outcomeEvent.getValue().get(id);
      this.validator.validateOutcome(outcome);
      setTimeout(() => {
        this.activeOutcome = id;
      }, 100);
    });
  }

  deleteOutcome(id: string) {
    this.store.execute(actions.DELETE_OUTCOME, { id }).then(() => {
      if (this.iterableOutcomes.length) {
        setTimeout(() => {
          this.activeOutcome = this.iterableOutcomes[
            this.iterableOutcomes.length - 1
          ].id;
        }, 100);
      }
    });
  }

  toggleStandardOutcome(data: {
    standardOutcome: LearningOutcome;
    value: boolean;
  }) {
    this.store.execute(
      data.value
        ? actions.MAP_STANDARD_OUTCOME
        : actions.UNMAP_STANDARD_OUTCOME,
      { id: this.activeOutcome, standardOutcome: data.standardOutcome }
    );
  }

  ngOnDestroy() {
    // observable cleanup on component destroy
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
