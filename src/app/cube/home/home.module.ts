import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { FeaturedComponent } from './featured/featured.component';
import { CommonModule } from '@angular/common';
import { CubeSharedModule } from '../shared/cube-shared.module';

@NgModule({
  imports: [FormsModule, CommonModule, SharedModule, CubeSharedModule, RouterModule],
  exports: [HomeComponent],
  declarations: [
    HomeComponent,
    FeaturedComponent
  ],
  providers: [],
})
export class HomeModule { }
