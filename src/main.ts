/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

// 🔹 Rediriger console si production
if (environment.production) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
