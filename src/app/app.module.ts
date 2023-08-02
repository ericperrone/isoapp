import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { ListFileComponent } from './data-processing/list-file/list-file.component';
import { HeaderComponent } from './main/header/header.component';
import { FileProcessComponent } from './data-processing/file-process/file-process.component';
import { ContentManagerComponent } from './data-processing/content-manager/content-manager.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { MainDataProcessingComponent } from './data-processing/main-data-processing/main-data-processing.component';
import { SampleDefinitionComponent } from './data-processing/sample-definition/sample-definition.component';
import { ContentManagerStep2Component } from './data-processing/content-manager-step2/content-manager-step2.component';
import { SaveDataComponent } from './data-processing/save-data/save-data.component';
import { AlertComponent } from './shared/modals/alert/alert.component';
import { FileCsvProcessComponent } from './data-processing/file-csv-process/file-csv-process.component';
import { ConfirmComponent } from './shared/modals/confirm/confirm.component';
import { SelectBoxComponent } from './shared/modals/select-box/select-box.component';
import { FileUploaderComponent } from './shared/modals/file-uploader/file-uploader.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ListFileComponent,
    HeaderComponent,
    FileProcessComponent,
    ContentManagerComponent,
    SpinnerComponent,
    MainDataProcessingComponent,
    SampleDefinitionComponent,
    ContentManagerStep2Component,
    SaveDataComponent,
    AlertComponent,
    FileCsvProcessComponent,
    ConfirmComponent,
    SelectBoxComponent,
    FileUploaderComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    NgbNavModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
