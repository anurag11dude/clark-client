
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicLevel, LearningObject } from '@cyber4all/clark-entity/dist/learning-object';
import { lengths } from '@cyber4all/clark-taxonomy';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import { Observable, Subject } from 'rxjs/Rx';
import { AuthService, AUTH_GROUP } from '../../core/auth.service';
import { CollectionService } from '../../core/collection.service';
import {
  SuggestionService
} from '../../onion/learning-object-builder/components/outcome-page/outcome/standard-outcomes/suggestion/services/suggestion.service';
import { FilterSection } from '../../shared/filter/filter.component';
import { OrderBy, Query, SortType } from '../../shared/interfaces/query';
import { ModalListElement, ModalService, Position } from '../../shared/modals';
import { LearningObjectService } from '../learning-object.service';
import { COPY } from './browse.copy';


@Component({
  selector: 'cube-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  providers: [ SuggestionService ]
})
export class BrowseComponent implements OnInit, OnDestroy {
  copy = COPY;
  learningObjects: LearningObject[] = Array(20).fill(new LearningObject);
  totalLearningObjects = 0;

  query: Query = {
    text: '',
    currPage: 1,
    limit: 20,
    length: [],
    level: [],
    standardOutcomes: [],
    orderBy: undefined,
    sortType: undefined,
    collection: '',
    released: this.auth.group.value !== AUTH_GROUP.ADMIN ? true : undefined
  };

  tooltipText = {
    nanomodule: 'a Learning Object up to 1 hour in length',
    micromodule: 'a Learning Object between 1 and 4 hours in length',
    module: 'a Learning Object between 4 and 10 hours in length',
    unit: 'a Learning Object over 10 hours in length',
    course: 'a Learning Object 15 weeks in length'
  };

  loading = true;
  mappingsPopup = false;

  error: string;

  pageCount: number;
  filtering = false;
  filters: FilterSection[] = [
    {
      name: 'collection',
      type: 'select-one',
      canSearch: false,
      values: []
    },
    {
      name: 'length',
      type: 'select-many',
      canSearch: false,
      values: [
        ...
        Array.from(lengths).map(l => ({name: l, toolTip: this.tooltipText[l.toLowerCase()]})),
      ]
    },
    {
      name: 'level',
      type: 'select-many',
      canSearch: false,
      values: [
        ...
        Object.values(AcademicLevel).map(l => ({name: l.toLowerCase(), toolTip: this.tooltipText[l.toLowerCase()]})),
      ]
    }
  ];
  searchDelaySubject: any;

  filterInput: Observable<string>;

  filtersDownMobile = false;
  windowWidth: number;

  unsubscribe: Subject<void> = new Subject();

  shouldResetPage = false;

  @HostListener('window:resize', ['$event']) handelResize(event) {
    this.windowWidth = event.target.innerWidth;
  }

  constructor(public learningObjectService: LearningObjectService, private route: ActivatedRoute,
    private router: Router, private modalService: ModalService, public mappingService: SuggestionService,
    private auth: AuthService,
    private collectionService: CollectionService,
    ) {
      this.windowWidth = window.innerWidth;
      this.learningObjects = Array(20).fill(new LearningObject);
  }

  ngOnInit() {
    // used by the performSearch function (when delay is true) to add a debounce effect
    this.searchDelaySubject = new Subject<void>().debounceTime(650);
    this.searchDelaySubject.takeUntil(this.unsubscribe).subscribe(() => {
      this.performSearch();
    });

    // whenever the queryParams change, map them to the query object and perform the search
    this.route.queryParams.takeUntil(this.unsubscribe).subscribe(async params => {
      try {
        const collections = await this.collectionService.getCollections();
        this.filters[0].values = collections.map(c => ({ name: c.name, value: c.abvName}));
        this.query.released = this.auth.group.getValue() !== AUTH_GROUP.ADMIN ? true : undefined;
        this.makeQuery(params);
        this.fetchLearningObjects(this.query);
      } catch (error) {
        this.loading = false;
        this.error = 'There was an error retrieving this learning object!';
        console.log(error);
      }
    });
  }

  get isMobile(): boolean {
    return this.windowWidth < 750;
  }

  // creates an array of numbers where each represents a page that can be navigated to.
  // defaults to a grand total of 5 pages, either your page in the middle and two on each side,
  // or (if you're say on page 2) 1 page on the left and 3 pages on the right. (1, 2, 3, 4, 5)
  get pages() {
    const total = 5;
    const cursor = +this.query.currPage;
    let count = 1;
    let upCount = 1;
    let downCount = 1;
    const arr = [cursor];

    if (this.learningObjects.length) {
      while (count < Math.min(total, this.pageCount)) {
        if (cursor + upCount <= this.pageCount) {
          arr.push(cursor + upCount++);
          count++;
        }

        if (cursor - downCount > 0) {
          arr.unshift(cursor - downCount++);
          count++;
        }
      }
    } else {
      return [];
    }

    return arr;
  }

  // navigate to previous page
  prevPage() {
    const page = +this.query.currPage - 1;
    if (page > 0) {
      this.query.currPage = page;
      this.shouldResetPage = false;
      this.performSearch();

    }
  }

  // navigate to next page
  nextPage() {
    const page = +this.query.currPage + 1;
    if (page <= this.pageCount) {
      this.query.currPage = page;
      this.shouldResetPage = false;
      this.performSearch();
    }
  }

  // navigate to a numbered page
  goToPage(page) {
    if (page > 0 && page <= this.pageCount) {
      this.query.currPage = +page;
      this.shouldResetPage = false;
      this.performSearch();

    }
  }

  clearSearch() {
    this.query.text = '';
    this.query.standardOutcomes = [];
    this.router.navigate(['browse'], {queryParams: {}});
  }

  get sortString() {
    return (this.query.orderBy) ? this.query.orderBy.replace(/_/g, '')
      + ' (' + ((this.query.sortType > 0) ? 'Asc' : 'Desc') + ')' : '';
  }

  toggleFilters() {
    this.filtersDownMobile = !this.filtersDownMobile;
  }

  closeFilters() {
    this.toggleFilters();
  }

  /**
   * This is used only on modal layouts, injects the tempFilter storage into the query object and sends it
   */
  applyFilters() {
    this.performSearch();
  }

  addFilter(key: string, value: string, clearFirst?: boolean) {
      this.modifyFilter(key, value, true, clearFirst);
      if (!this.filtersDownMobile) {
        this.performSearch(true);
      }
  }

  removeFilter(key: string, value: string) {
      this.modifyFilter(key, value);
      if (!this.filtersDownMobile) {
        this.performSearch(true);
      }
  }

  clearAllFilters(sendFilters: boolean = true) {
    for (let i = 0, l = this.filters.length; i < l; i++) {
      if (this.filters[i].values) {
        for (let k = 0, j = this.filters[i].values.length; k < j; k++) {
          this.filters[i].values[k].active = false;
        }
      }
    }

    if (sendFilters) {
      this.performSearch(true);
    }
  }

  private modifyFilter(key: string, value: string, active = false, clearFirst?: boolean) {
    for (let i = 0, l = this.filters.length; i < l; i++) {
      if (this.filters[i].name === key) {
        // found the correct filter category
        if (this.filters[i].values) {
          for (let k = 0, j = this.filters[i].values.length; k < j; k++) {
            if (clearFirst && active) {
              // for each iteration set to false if this is a select-one instance vs a select-many instance
              this.filters[i].values[k].active = false;
            }

            if (this.filters[i].values[k].name === value || this.filters[i].values[k].value === value) {
              // found the correct filter
              this.filters[i].values[k].active = active;

              if (!clearFirst) {
                // if we don't need to see every filter in this category, jsut return now
                // for efficiency
                return;
              }
            }
          }

          // if clearFirst is true, inner return won't be fired, this will prevent iterating
          // accross unneccessary categories
          return;
        }
      }
    }
  }

  /**
   * Executes a search by reading throuhg the query object and mapping it to query parameters and then re-navigating to the component
   * @param delay if true, triggers a debounced subject, which will call performSearch again with no delay
   */
  performSearch(delay: boolean = false) {
    if (delay) {
      this.searchDelaySubject.next();
    } else {
      for (let i = 0, l = this.filters.length; i < l; i++) {
        const category = this.filters[i];
        let active;

        if (category.values) {
          active = category.values.filter(v => v.active);
        } else {
          // TODO implement adding non-value (custom component) filters
          active = [];
        }

        if (active.length) {
          // there are filters in this category
          this.query[category.name] = active.map(v => v.value || v.name);
        } else {
          this.query[category.name] = [];
        }
      }

      // if we're adding a filter that isn't a page change, reset the currPage in query to 1
      if (this.shouldResetPage) {
        this.query.currPage = 1;
      } else {
        this.shouldResetPage = true;
      }

      this.router.navigate(['browse'], {queryParams: this.removeObjFalsy(this.query)});
    }
  }

  showSortMenu(event) {
    const currSort = (this.query.orderBy) ?
      this.query.orderBy.replace(/_/g, '') + '-' + ((this.query.sortType > 0) ? 'asc' : 'desc') : undefined;
      const sub = this.modalService.makeContextMenu(
        'SortContextMenu',
        'dropdown',
        [
          new ModalListElement('Date (Newest first)', 'date-desc', (currSort === 'date-desc') ? 'active' : undefined),
          new ModalListElement('Date (Oldest first)', 'date-asc', (currSort === 'date-asc') ? 'active' : undefined),
          new ModalListElement('Name (desc)', 'name-desc', (currSort === 'name-desc') ? 'active' : undefined),
          new ModalListElement('Name (asc)', 'name-asc', (currSort === 'name-asc') ? 'active' : undefined),
        ],
        true,
        null,
        new Position(
          this.modalService.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
          this.modalService.offset(event.currentTarget).top + 50))
        .subscribe(val => {
          if (val !== 'null' && val.length) {
            const dir = val.split('-')[1];
            const sort = val.split('-')[0];
            this.query.orderBy = sort.charAt(0) === 'n' ? OrderBy.Name : OrderBy.Date;
            this.query.sortType = (dir === 'asc') ? SortType.Ascending : SortType.Descending;

            this.performSearch();
          }
          sub.unsubscribe();
        });
  }

  clearSort(event) {
    event.stopPropagation();
    this.query.orderBy = undefined;
    this.query.sortType = undefined;
    this.performSearch();
  }

  /**
   * Takes an object of parameters and attempts to map them to the query objcet
   * @param {*} params the object returned from subscribing to the routers queryParams observable
   */
  makeQuery(params: any) {
    const paramKeys = Object.keys(params);
    // iterate params object
    for (let i = 0, l = paramKeys.length; i < l; i++) {
      const key = paramKeys[i];

      if (Object.keys(this.query).includes(key)) {
        const val = params[key];
        // this parameter is a query param, add it to the query object
        this.query[key] = val;

        // add it to filter list to force checkbox
        if (Array.isArray(val)) {
          for (let k = 0, j = val.length; k < j; k++) {
            this.modifyFilter(key, val[k], true);
          }
        } else {
          this.modifyFilter(key, val, true);
        }
      }
    }
  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = Array(20).fill(new LearningObject);
    // Trim leading and trailing whitespace
    query.text = query.text.trim();
    const { learningObjects, total } = await this.learningObjectService.getLearningObjects(query);
    this.learningObjects = learningObjects;
    this.totalLearningObjects = total;
    this.pageCount = Math.ceil(total / +this.query.limit);
    this.loading = false;
    this.error = undefined;
  }

  /**
   * Deep copy and strip all falsy values (and empty arrays) from an object
   */
  private removeObjFalsy(obj: any): any {
    const keys = Object.keys(obj);
    // deep copy object to prevent direct modification of passed object
    const output = Object.assign({}, obj);

    for (let i = 0, l = keys.length; i < l; i++) {
      if (!output[keys[i]] || (Array.isArray(output[keys[i]]) && output[keys[i]].length === 0)) {
        delete output[keys[i]];
      }
    }

    return output;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
  }

}
