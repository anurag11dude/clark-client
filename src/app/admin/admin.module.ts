import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LearningObjectsComponent } from './pages/learning-objects/learning-objects.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { UsersComponent } from './pages/users/users.component';
import { ContentWrapperComponent } from './components/content-wrapper/content-wrapper.component';

@NgModule({
  declarations: [AdminComponent, SidebarComponent, LearningObjectsComponent, AnalyticsComponent, UsersComponent, ContentWrapperComponent],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }