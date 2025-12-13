import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-ia',
  imports:[CommonModule,
    FormsModule,],
  templateUrl: './ag-grid.component.html',
  styleUrl: './ag-grid.component.scss'
})
export class AgGridComponent {
  private apiUrl = 'http://localhost:5000/predict'; // URL de l'API Flask

  formData: any = {
    'Typologie du marché': '',
    'Montant du contrat': null,
    'Garantie': '',
    'Délai de réalisation': null,
    'Expérience fournisseur': null,
    'Nombre de projets similaires': null,
    'Notation interne': null,
    'Chiffre d\'affaire': null,
    'Situation fiscale': '',
    'Fournisseur blacklisté': ''
  };

  predictionResult: any;
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  predict(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  onSubmit() {
    this.loading = true;
    this.predict(this.formData).subscribe(
      response => {
        this.predictionResult = response;
        this.loading = false;
        console.log(this.predictionResult);
      },
      error => {
        this.loading = false;
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    );
  }
}
