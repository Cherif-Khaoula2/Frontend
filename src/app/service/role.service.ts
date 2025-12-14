import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

const BASE_URL = "https://cmeapp.sarpi-dz.com/api/user/";

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpClient, private router: Router) {}

  createRole(role: any): Observable<any> {
    return this.http.post(`${BASE_URL}roles`, role, { withCredentials: true }).pipe(
      tap(response => console.log("✅ Rôle ajouté :", response)),
      catchError(err => {
        console.error("❌ Erreur lors de l'ajout du rôle", err);
        return throwError(() => new Error("Ajout du rôle échoué."));
      })
    );
  }
  getAllPermissions(): Observable<any> {
    return this.http.get(`${BASE_URL}permissions`, { withCredentials: true }).pipe(
      tap(response => console.log("✅ Permissions récupérées :", response)),
      catchError(err => {
        console.error("❌ Erreur lors de la récupération des permissions", err);
        return throwError(() => new Error("Impossible de récupérer les permissions."));
      })
    );
  }

  // ✅🔹 Récupérer tous les rôles
  getAllRoles(): Observable<any> {
    return this.http.get(`${BASE_URL}roles`, { withCredentials: true }).pipe(
      tap(response => console.log("✅ Rôles récupérés :", response)),
      catchError(err => {
        console.error("❌ Erreur lors de la récupération des rôles", err);
        return throwError(() => new Error("Impossible de récupérer les rôles."));
      })
    );
  }

  // ✅🔹 Récupérer un rôle par ID
  getRoleById(id: number): Observable<any> {
    return this.http.get(`${BASE_URL}roles/${id}`, { withCredentials: true }).pipe(
      tap(response => console.log(`✅ Rôle ID ${id} récupéré :`, response)),
      catchError(err => {
        console.error(`❌ Erreur lors de la récupération du rôle ID ${id}`, err);
        return throwError(() => new Error("Impossible de récupérer ce rôle."));
      })
    );
  }

  // ✅🔹 Modifier un rôle
  updateRole(id: number, role: any): Observable<any> {
    return this.http.put(`${BASE_URL}roles/${id}`, role, { withCredentials: true }).pipe(
      tap(response => console.log(`✅ Rôle ID ${id} mis à jour :`, response)),
      catchError(err => {
        console.error(`❌ Erreur lors de la mise à jour du rôle ID ${id}`, err);
        let errorMessage = "Modification du rôle échouée.";
        if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // ✅🔹 Supprimer un rôle
  deleteRole(id: number): Observable<string> { // Expecting a string response
    return this.http.delete(`${BASE_URL}roles/${id}`, { withCredentials: true, responseType: 'text' }).pipe(
      tap((response: string) => console.log(`✅ Rôle ID ${id} supprimé: ${response}`)),
      catchError(err => {
        console.error(`❌ Erreur lors de la suppression du rôle ID ${id}`, err);
        let errorMessage = "Suppression du rôle échouée.";
        if (err.error && typeof err.error === 'string') {
          errorMessage = err.error; // Capture backend error message if it's a string
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
