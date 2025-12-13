import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

const BASE_URL = 'http://localhost:8082/email/';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private http: HttpClient) {}

  sendEmail(emailData: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('text', emailData.text);

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.post<any>(`${BASE_URL}send-email-attachment`, formData, {
      withCredentials: true, // ✅ Permet d'envoyer le cookie HttpOnly
      responseType: 'json'
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
        return throwError(() => new Error(error.error?.error || 'Problème de communication avec le serveur'));
      })
    );
  }

  getAllemails(): Observable<any> {
    return this.http.get(`${BASE_URL}archive`, { withCredentials: true }); // ✅ Ajout de withCredentials
  }

  getemailsenvoyer(): Observable<any> {
    return this.http.get(`${BASE_URL}sent`, { withCredentials: true }); // ✅ Ajout de withCredentials
  }

  getemailsrecevoir(): Observable<any> {
    return this.http.get(`${BASE_URL}received`, { withCredentials: true }); // ✅ Ajout de withCredentials
  }
  getEmailById(id: number): Observable<any> {
    return this.http.get(`${BASE_URL}${id}`, { withCredentials: true }); // Assurez-vous que votre API a cette route
  }
}
