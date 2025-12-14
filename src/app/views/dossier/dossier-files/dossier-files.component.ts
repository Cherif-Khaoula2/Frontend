import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DossierService } from '../../../service/dossier.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-dossier-files',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dossier-files.component.html',
  styleUrls: ['./dossier-files.component.scss']
})
export class DossierFilesComponent implements OnInit, OnChanges { // Implement OnChanges
  dossier: any;
  dossierId!: number;
  dossiers: any[] = [];
  @Input() dossierDetails: any;
  @Input() traitement: any;

  constructor(
    private dossierService: DossierService,
    private route: ActivatedRoute,
      private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.dossierId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchDossierById(this.dossierId);
    this.fetchDossiers();

  
  }

  fetchDossiers() {
    this.dossierService.getAllDossiers().subscribe({
      next: (data) => {
        this.dossiers = data;
      },
      error: (err) => {
        console.error("❌ Erreur lors de la récupération des dossiers", err);
      }
    });
  }

  fetchDossierById(id: number) {
    this.dossierService.getDossierById(id).subscribe({
      next: (data) => {
        this.dossier = data.dossier;
      },
      error: (err) => {
        console.error('❌ Erreur lors de la récupération du dossier', err);
      }
    });
  }

  getFilesNames(fileDetails: any): string[] {
    return fileDetails ? Object.keys(fileDetails) : [];
  }


 openMergedPdf() {
  const url = `https://cmeapp.sarpi-dz.com/pdfapi/generate-merged-files-pdf/${this.dossierId}`;
  this.http.get(url, {
    responseType: 'blob',
    withCredentials: true // ⬅️ Important pour envoyer le cookie JWT
  }).subscribe(blob => {
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl); // Ouvre le PDF dans un nouvel onglet
  }, error => {
    console.error('Erreur lors de la génération du PDF:', error);
    alert("Impossible de générer le fichier PDF.");
  });
}


  generateSingleDossierPdf() {
  this.http.get(`https://cmeapp.sarpi-dz.com/pdfapi/generate-dossier-pdf/${this.dossierId}`, {
    responseType: 'blob',
    withCredentials: true // très important si cookies sécurisés
  }).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }, error => {
    console.error('Erreur lors de la génération du PDF:', error);
    alert("Erreur lors de la génération du dossier PDF.");
  });
}
  ngOnChanges(changes: SimpleChanges): void {
    // This lifecycle hook is important to react to changes in the @Input()
    if (changes['dossierDetails'] && changes['dossierDetails'].currentValue) {
      // You might want to do something here when dossierDetails updates
      // For example, log it or set internal properties based on it
      // console.log('DossierFilesComponent ngOnChanges - dossierDetails updated:', this.dossierDetails);
    }
  }
  openFile(fileIdOrUrl: string) {
    let fileUrl: string;
    // Vérifiez si la valeur ressemble déjà à une URL
    if (fileIdOrUrl.startsWith('http://') || fileIdOrUrl.startsWith('https://')) {
      fileUrl = fileIdOrUrl;
    } else {
      // Si ce n'est pas une URL, assumez que c'est un ID et construisez l'URL
      fileUrl = `https://cmeapp.sarpi-dz.com/attachments/api/attachments/view/${fileIdOrUrl}`;
    }
    
    window.open(fileUrl, '_blank');
  }


}
