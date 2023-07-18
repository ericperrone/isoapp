import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ListFileComponent } from './data-processing/list-file/list-file.component'
import { FileProcessComponent } from './data-processing/file-process/file-process.component';
import { ContentManagerComponent } from './data-processing/content-manager/content-manager.component';
import { ContentManagerStep2Component } from './data-processing/content-manager-step2/content-manager-step2.component';
import { MainDataProcessingComponent } from './data-processing/main-data-processing/main-data-processing.component';
import { SampleDefinitionComponent } from './data-processing/sample-definition/sample-definition.component';


const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full'},
  { path: 'main', component: MainComponent },
  { path: 'main-data-processing', component: MainDataProcessingComponent },
  { path: 'file-list', component: ListFileComponent },
  { path: 'file-process', component: FileProcessComponent },
  { path: 'content-manager', component: ContentManagerComponent },
  { path: 'content-manager2', component: ContentManagerStep2Component },
  { path: 'sample-definition', component: SampleDefinitionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
