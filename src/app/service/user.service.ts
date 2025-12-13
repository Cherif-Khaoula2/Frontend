import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

const BASE_URL = "https://cmeapp.sarpi-dz.com/api/user/api/";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private router: Router) { }

  // Fonction pour récupérer tous les utilisateurs (avec cookies)
  getAllUsers(): Observable<any> {
    return this.http.get(`${BASE_URL}users`, { withCredentials: true });
  }

  getAllRoles(): Observable<any> {
    return this.http.get(`${BASE_URL}roles`, { withCredentials: true });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${BASE_URL}users/${id}`, { withCredentials: true });
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${BASE_URL}users`, user, { withCredentials: true });
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${BASE_URL}users/${id}`, user, { withCredentials: true });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${BASE_URL}users/${id}`, {
      withCredentials: true,
      responseType: 'text'
    });
  }

  // Fonction de déconnexion
  logout(): void {
    this.http.post(`${BASE_URL}logout`, {}, { withCredentials: true }).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }



}
