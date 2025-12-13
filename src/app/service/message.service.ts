import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private successMessageSource = new BehaviorSubject<string | null>(null);
  successMessage$ = this.successMessageSource.asObservable();

  private errorMessageSource = new BehaviorSubject<string | null>(null);
  errorMessage$ = this.errorMessageSource.asObservable();

  setSuccessMessage(message: string): void {
    this.successMessageSource.next(message);
  }

  clearSuccessMessage(): void {
    this.successMessageSource.next(null);
  }

  setErrorMessage(message: string): void {
    this.errorMessageSource.next(message);
  }

  clearErrorMessage(): void {
    this.errorMessageSource.next(null);
  }
}
