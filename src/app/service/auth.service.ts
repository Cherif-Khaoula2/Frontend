import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // ✅ Import de HttpHeaders
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://cmeapp.sarpi-dz.com/api/user/';

  constructor(private http: HttpClient) {}

  sendOtp(email: string) {
    return this.http.post(`${this.apiUrl}forgot-password`, { email }, { responseType: 'text' });
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-otp?email=${email}&otp=${otp}`, {});
  }

  resetPassword(newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}reset-password`, { newPassword, confirmPassword });
  }

}
