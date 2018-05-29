import { SuggestionService } from './services/suggestion.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuggestionComponent } from './suggestion.component';
import { SuggestionFilterComponent } from './suggestion-filter.component';
import { FormsModule } from '@angular/forms';
import { MappingsListComponent } from '../mappings-list/mappings-list.component';
import { TooltipModule } from '@cyber4all/clark-tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule
  ],
  exports: [
    SuggestionComponent,
    SuggestionFilterComponent,
    MappingsListComponent
  ],
  providers: [
    SuggestionService
  ],
  declarations: [
    MappingsListComponent,
    SuggestionComponent,
    SuggestionFilterComponent
  ]
})
export class SuggestionModule { }