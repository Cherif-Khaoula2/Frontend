import { AfterViewInit, Component, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";

import {
  ClientSideRowModelModule,
  ColDef,

  GridReadyEvent,
  ModuleRegistry,
  NumberFilterModule,
  TextFilterModule,
  ValidationModule,
  PaginationModule,

  NumberEditorModule,
  TextEditorModule,
  ColumnAutoSizeModule,
  CellStyleModule,
} from "ag-grid-community";
ModuleRegistry.registerModules([
  ColumnAutoSizeModule,
  NumberEditorModule,
  TextEditorModule,
  TextFilterModule,
  NumberFilterModule,
  PaginationModule,
  ClientSideRowModelModule,
  ValidationModule,
  CellStyleModule /* Development Only */,
]);


import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TextColorDirective
} from '@coreui/angular';
import { CommonModule } from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../../../service/user.service";
import {IconDirective} from "@coreui/icons-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DossierService } from "../../../service/dossier.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-voir',
  standalone: true,
  imports: [AgGridAngular, CommonModule, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, IconDirective, FormsModule],

  templateUrl: './voir.component.html',
  styleUrl: './voir.component.scss'
})
export class VoirComponent {
  private apiUrl = "https://cmeapp.sarpi-dz.com/blacklist/blacklist";
  nomFournisseur = '';
  isBlacklisted: boolean | null = null;
    getAlls(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}`,{withCredentials: true});
    }
 rowData: any[] = []; // Données pour le tableau
  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'id', sortable: true, filter: true , lockPosition: "left", cellClass: "locked-col" },
    { headerName: 'Nom fournissuer ', field: 'denomination', sortable: true, filter: true },
    { headerName: 'activite', field: 'activite', sortable: true, filter: true },
    { headerName: 'structureDemandeExclusion', field: 'structureDemandeExclusion', sortable: true, filter: true },
    { headerName: 'dateExclusion ', field: 'dateExclusion', sortable: true, filter: true },
    { headerName: 'motifs', field: 'motifs', sortable: true, filter: true },
    { headerName: 'dureeExclusion', field: 'dureeExclusion', sortable: true, filter: true },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        return `
           <button class="btn btn-sm btn-primary edit-btn" data-id="${params.data.id}">Modifier</button>
           <button class="btn btn-sm btn-danger delete-btn" data-id="${params.data.id}">Supprimer</button>
         `;
      },
      width: 200,
      cellStyle: { textAlign: 'center' } , lockPosition: "right", cellClass: "locked-col"
    }
  ];

  defaultColDef = { flex: 1, minWidth: 100, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

   constructor(private http: HttpClient,
    private router: Router,
    private renderer: Renderer2, private dossierService: DossierService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  addActionListeners() {
    const table = document.querySelector('ag-grid-angular');
    if (table) {
      this.renderer.listen(table, 'click', (event: Event) => {
        const target = event.target as HTMLElement;
        const userId = target.getAttribute('data-id');

        if (userId) {
          const numericUserId = Number(userId);
          if (isNaN(numericUserId)) {
            console.error("ID utilisateur invalide :", userId);
            return;
          }


        }
      });
    }
  }

  // Mettre à jour un utilisateur
  editUser(userId: number): void {
    this.router.navigate(['/base/edit-user', userId]);
  }


  getUsers() {
    this.getAlls().subscribe({
      next: (data) => {
        this.rowData = data.map((fournisseur: any) => ({
          id: fournisseur.id,
          denomination: fournisseur.denomination,
          activite: fournisseur.activite,
          structureDemandeExclusion: fournisseur.structureDemandeExclusion,
          dateExclusion: fournisseur.dateExclusion,
          motifs: fournisseur.motifs,
          dureeExclusion: fournisseur.dureeExclusion,

        }));
      },
      error: (err) => console.error("Erreur lors de la récupération des utilisateurs", err)
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  // Optimisation pour *ngFor
  trackById(index: number, user: any): number {
    return user.id;
  }
  add(): void {
    this.router.navigate(['/base/ajouteuser']);
  }
  generatePdfReport() {
    window.open('https://cmeapp.sarpi-dz.com/pdfapi/generate-pdf', '_blank');
  }
  check() {
    this.dossierService.checkFournisseur(this.nomFournisseur).subscribe({
      next: (res) => {
        this.isBlacklisted = res === true;
        Swal.fire({
          icon: this.isBlacklisted ? 'error' : 'success',
          title: this.isBlacklisted ? 'Fournisseur blacklisté' : 'Fournisseur autorisé',
          text: this.isBlacklisted
            ? '⚠️ Ce fournisseur est dans la liste noire.'
            : '✅ Ce fournisseur n’est pas blacklisté.'
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la vérification.'
        });
      }
    });
  }
}

