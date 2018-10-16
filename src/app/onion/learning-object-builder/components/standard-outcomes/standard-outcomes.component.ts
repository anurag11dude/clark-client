import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { OutcomeService } from 'app/core/outcome.service';
import {
  BuilderStore,
  BUILDER_ACTIONS as actions
} from '../../builder-store.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime, filter, map } from 'rxjs/operators';

export interface SuggestedOutcome extends LearningOutcome {
  suggested?: boolean;
}

@Component({
  selector: 'clark-standard-outcomes',
  templateUrl: './standard-outcomes.component.html',
  styleUrls: ['./standard-outcomes.component.scss']
})
export class StandardOutcomesComponent implements OnInit, OnChanges, OnDestroy {
  // id of the currently selected outcome
  @Input()
  activeOutcome: string;

  @Output()
  toggleMapping: EventEmitter<{
    standardOutcome: LearningOutcome;
    value: boolean;
  }> = new EventEmitter();

  searchStringValue = '';
  searchString$: BehaviorSubject<string> = new BehaviorSubject('');

  suggestStringValue = '';
  suggestString$: Subject<string> = new Subject();

  componentDestroyed$: Subject<void> = new Subject();

  suggestions: SuggestedOutcome[] = [];
  searchResults: SuggestedOutcome[] = [];

  selectedOutcomeIDs: string[] = [];

  activeOutcomeSubscription: Subscription;

  loading = undefined;

  constructor(
    private outcomeService: OutcomeService,
    private store: BuilderStore
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeOutcome && changes.activeOutcome.currentValue) {
      this.searchString$.next('');

      // if we have an open subscription to an outcome, close it
      if (this.activeOutcomeSubscription) {
        this.activeOutcomeSubscription.unsubscribe();
      }

      // grab full selected outcome from activeOutcome id and suggest outcomes for it
      const currentOutcome = this.store.outcomes.get(this.activeOutcome);

      if (currentOutcome.verb && currentOutcome.verb !== '') {
        // don't perform suggestion queryies on a blank outcome
        this.suggestStringValue = currentOutcome.verb + ' ' + currentOutcome.text;
        this.suggestString$.next(this.suggestStringValue);
        this.selectedOutcomeIDs = currentOutcome.mappings.map(x => x.id);

        // toggle the loading flag to true to give a longer representation of loading
        // this is necessary to provide instant feedback (the query is debounced 1 second)
        this.loading = 'suggest';
      } else {
        this.suggestions = [];
        this.suggestStringValue = '';
      }


      // subscribe to the store service and filter out the activeOutcome
      this.activeOutcomeSubscription = this.store.event
        .pipe(
          takeUntil(this.componentDestroyed$),
          filter(
            x => x.type === 'outcome' && x.payload.get(this.activeOutcome)
          ),
          map(x => x.payload.get(this.activeOutcome))
        )
        .subscribe((outcome: LearningOutcome) => {
          // this outcome is the currently selected outcome, this function fires everytime the outcome's text changes
          const tempSuggestString = outcome.verb + ' ' + outcome.text;

          // if the text has changed, requery for suggestions
          if (this.suggestStringValue !== tempSuggestString) {
            this.suggestStringValue = tempSuggestString;
            this.suggestString$.next(this.suggestStringValue);
          }

          // update the selected outcomes list
          this.selectedOutcomeIDs = outcome.mappings.map(x => x.id);
        });
    }
  }

  ngOnInit() {
    // handle searching
    this.searchString$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(650)
      )
      .subscribe(() => {
        if (!this.searchStringValue || this.searchStringValue === '') {
          // string was empty, clear results
          this.searchResults = [];
        } else {
          // perform search
          this.loading = 'search';
          this.outcomeService
            .getOutcomes({
              text: this.searchStringValue
            })
            .then(results => {
              if (this.suggestions.length) {
                // if we have suggestions, tag any of the search results that are also suggestions
                const suggestedIds: string[] = this.suggestions.map(o => o.id);
                this.searchResults = results.outcomes.map(o => {
                  o.suggested = suggestedIds.includes(o.id);
                  return o;
                });
              } else {
                this.searchResults = results.outcomes;
              }

              this.loading = undefined;
            });
        }
      });

    // handle suggesting
    this.suggestString$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(1000)
      )
      .subscribe((val: string) => {
        if (val && val !== '') {
          this.loading = 'suggest';
          this.outcomeService
            .suggestOutcomes(this.store.learningObject, { text: val })
            .then(results => {
              this.suggestions = results.map(o => {
                o.suggested = true;
                return o;
              });
              this.loading = undefined;
            });
        }
      });
  }

  toggleStandardOutcome(standardOutcome: LearningOutcome, value: boolean) {
    this.toggleMapping.emit({ standardOutcome, value });
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
