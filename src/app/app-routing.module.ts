import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ListFileComponent } from './data-processing/list-file/list-file.component'
import { FileProcessComponent } from './data-processing/file-process/file-process.component';
import { FileCsvProcessComponent } from './data-processing/file-csv-process/file-csv-process.component';
import { ContentManagerComponent } from './data-processing/content-manager/content-manager.component';
import { ContentManagerStep2Component } from './data-processing/content-manager-step2/content-manager-step2.component';
import { MainDataProcessingComponent } from './data-processing/main-data-processing/main-data-processing.component';
import { SampleDefinitionComponent } from './data-processing/sample-definition/sample-definition.component';
import { SaveDataComponent } from './data-processing/save-data/save-data.component';


const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full'},
  { path: 'main', component: MainComponent },
  { path: 'main-data-processing', component: MainDataProcessingComponent },
  { path: 'file-list', component: ListFileComponent },
  { path: 'file-process', component: FileProcessComponent },
  { path: 'file-csv-process', component: FileCsvProcessComponent },
  { path: 'content-manager', component: ContentManagerComponent },
  { path: 'content-manager2', component: ContentManagerStep2Component },
  { path: 'sample-definition', component: SampleDefinitionComponent },
  { path: 'save-data', component: SaveDataComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
