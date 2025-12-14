import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
export interface BlacklistDTO {
  denomination: string;
  activite: string;
  structureDemandeExclusion: string;
  dateExclusion: string;
  motifs: string;
  dureeExclusion: number;
}
export interface Dossier {
  id: number;
  numeroDossier: string;
  intitule: string;
  etat: string;
  typePassation: string;
  dateSoumission: string;
  chargeDossierName?: string;
  chargeDossierEmail?: string;
  chargeDossierId?: string;
  fileDetails: { [key: string]: string };
  resultats: Resultat[];
  decisions: Decision[];
}

export interface Resultat {
  id: number;
  resultat: string;
  compteRendu: string;
  dateAjout: string;
  chargeDossierName?: string;
  chargeDossierEmail?: string;
  chargeDossierId?: string;}

export interface Decision {
  id: number;
  decision: string;
  dateAjout: string;
  chargeDossierName?: string;
  chargeDossierEmail?: string;
chargeDossierId?: string;}

@Injectable({
  providedIn: 'root',
})
export class DossierService {
  private apiUrl = 'https://cmeapp.sarpi-dz.com/dossiers/api/dossiers';
  private passationUrl = 'https://cmeapp.sarpi-dz.com/dossiers/api/passations'; // API pour Enum
  private  pdfUrl = 'https://cmeapp.sarpi-dz.com/pdfapi/generate-merged-files-pdf';
 private listUrl  = 'https://cmeapp.sarpi-dz.com/blacklist/blacklist';
  constructor(private http: HttpClient) {}

  ajouterDossier(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { withCredentials: true });
  }

  getPassations(): Observable<string[]> {
    return this.http.get<string[]>(this.passationUrl, {withCredentials: true});


  }

  deleteDossier(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
  getDossiersByTypeOnly(typePassation: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-type-only/${typePassation}`,{withCredentials: true});
  }
  getDossiersByType(typePassation: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-type/${typePassation}`,{withCredentials: true});
  }
  updateDossier(dossierId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${dossierId}`, formData, { withCredentials: true });
  }
  getDossierById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
  getDossierByIdd(id: number): Observable<any> {
    return this.http.get<any>(`https://cmeapp.sarpi-dz.com/dossiers/api/decisions/dossiers/{{id}}`,{withCredentials: true});
  }

  getDossierByNumeroDossier(numeroDossier: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/byNumeroDossier/${numeroDossier}`, { withCredentials: true });
  }
  mergePdfFiles(files: string[],id: number): Observable<any> {
    return this.http.post<any>(`${this.pdfUrl}/${id}`, {withCredentials: true});
  }
  getAllDossiers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`,{withCredentials: true});
  }
  getAllDossierswithout(): Observable<any[]> {
    return this.http.get<any[]>(` https://cmeapp.sarpi-dz.com/dossiers/api/resultats/dossiers-sans-mon-resultat`,{withCredentials: true});
  }

  getAlllDossiers(): Observable<any[]> {
    return this.http.get<any[]>(`https://cmeapp.sarpi-dz.com/dossiers/api/decisions/dossiers-sans-decision`,{withCredentials: true});
  }
  addToBlacklist(data: BlacklistDTO): Observable<any> {
    return this.http.post(`${this.listUrl}`, data, { withCredentials: true });
  }

  checkFournisseur(nomFournisseur: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.listUrl}/check?nomFournisseur=${encodeURIComponent(nomFournisseur)}`, { withCredentials: true });
  }
  changerEtatDossier(id: number, nouvelEtat: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/changer-etat?nouvelEtat=${nouvelEtat}`, {withCredentials: true });
  }
  getStatsParEtat(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>('https://cmeapp.sarpi-dz.com/dossiers/api/dossiers/stats/etat');
  }
  ajouterResultatEtCompteRendu(idDossier: number, resultat: string, compteRendu: string) {
    const params = new HttpParams()
      .set('resultat', resultat)
      .set('compteRendu', compteRendu);

    return this.http.post(
      `https://cmeapp.sarpi-dz.com/dossiers/api/resultats/dossiers/${idDossier}/resultat`,
      null,  // pas de body
      { params: params, withCredentials: true }
    );
  }

  getResultatByDossierId(dossierId: number) {
    return this.http.get<any>(`https://cmeapp.sarpi-dz.com/dossiers/api/resultats/dossiers/${dossierId}/resultat`, {withCredentials: true });
  }

  getAllResultatsByDossierId(id: number) {
    return this.http.get<any[]>(`https://cmeapp.sarpi-dz.com/dossiers/api/resultats/dossiers/${id}/resultats`, {withCredentials: true });
  }

  ajouterDecision(idDossier: number, decision: string, compteRendu?: string) {
    let params = new HttpParams()
      .set('decision', decision);

    if (compteRendu) {
      params = params.set('compteRendu', compteRendu);
    }

    return this.http.post(
      `https://cmeapp.sarpi-dz.com/dossiers/api/decisions/dossiers/${idDossier}/ajouter`,
      null,
      { params: params, withCredentials: true }
    );
  }

  // dossier.service.ts
  // For now, keep it specific if only 'dateHeureReunion' is truly expected here.

  getVisaRefusDecisions(): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`https://cmeapp.sarpi-dz.com/dossiers/api/decisions/decision/Refus de visa`, { withCredentials: true });
  }
  getVisaSansReserveDecisions(): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`https://cmeapp.sarpi-dz.com/dossiers/api/decisions/decision/Visa sans réserve`, { withCredentials: true });
  }
  getVisaAvecREserveSuspDecisions(): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`https://cmeapp.sarpi-dz.com/api/decisions/decision/Visa avec réserve suspensive`, { withCredentials: true });
  }
  getVisaSansREserveSuspDecisions(): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(`https://cmeapp.sarpi-dz.com/dossiers/api/decisions/decision/Visa sans réserve sunsponsive`, { withCredentials: true });
  }

  ajouterRendezVous(id: number, data: { dateHeureReunion: string }): Observable<any> {
    // No need for HttpParams if sending JSON body
    // The 'data' object is already the JSON payload you want to send.

    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Crucial: Send as JSON
    });

    return this.http.post(
      `https://cmeapp.sarpi-dz.com/dossiers/api/reunions/dossiers/${id}/ajouter`,
      data, // Send the 'data' object directly as JSON body
      { headers: headers, withCredentials: true }
    );
  }

}
