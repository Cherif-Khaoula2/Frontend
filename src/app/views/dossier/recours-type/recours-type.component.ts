import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TextColorDirective
} from "@coreui/angular";
import {
  ClientSideRowModelModule, ColDef, GridReadyEvent, ModuleRegistry,
  NumberFilterModule, TextFilterModule, ValidationModule, PaginationModule,
  DateFilterModule, NumberEditorModule, TextEditorModule, ColumnAutoSizeModule, 
  CellStyleModule, ICellRendererParams
} from "ag-grid-community";
import { Router } from "@angular/router";
import { AuthService } from "../../../service/auth.service";

ModuleRegistry.registerModules([
  ColumnAutoSizeModule, NumberEditorModule, TextEditorModule, TextFilterModule,
  NumberFilterModule, PaginationModule, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, CellStyleModule
]);

@Component({
  selector: 'app-recours-type',
  templateUrl: './recours-type.component.html',
  styleUrls: ['./recours-type.component.scss'],
  standalone: true,
  imports: [
    AgGridAngular, CommonModule, TextColorDirective, CardComponent,
    CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, FormsModule
  ],
})
export class RecoursTypeComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  
  // Variables pour les modales de confirmation
  deleteConfirmationVisible: boolean = false;
  updateConfirmationVisible: boolean = false;
  numeroDossier: string = '';
  currentDossierId: number | null = null;
  
  // Variables pour les messages
  errorMessage: string | null = null;
  successMessage: string | null = null;

  columnDefs: ColDef[] = [
    { headerName: 'Intitulé', field: 'intitule', sortable: true, filter: true, resizable: true },
    { headerName: 'Numéro Dossier', field: 'numeroDossier', sortable: true, filter: true, resizable: true },
    {
      headerName: "État", 
      field: "etat", 
      sortable: true, 
      filter: true,
      cellStyle: (params) => this.getEtatTextColorStyle(params)
    },
    { headerName: 'Chargé', field: 'chargeDossier', sortable: true, filter: true, resizable: true },
    {
      headerName: "Date Soumission",
      field: "dateSoumission",
      sortable: true,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => this.formatDate(params.value),
      valueGetter: (params) => params.data?.dateSoumission ? new Date(params.data.dateSoumission) : null,
    },
    {
      headerName: 'Fichiers',
      field: 'fileDetails',
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value || typeof params.value !== 'object') return '';
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm';
        button.innerText = '📁 Voir ';
        const dossierId = params.data?.id;
        button.addEventListener('click', () => {
          this.router.navigate([`/dossier/dossiers/${dossierId}/fichiers`]);
        });
        return button;
      },
      width: 250,
    },
    {
      headerName: 'Actions',
      width: 250,
      suppressSizeToFit: true,
      cellRenderer: (params: ICellRendererParams) => {
        const dossier = params.data;
        const dossierId = dossier?.id;
        const etat = dossier?.etat;

        const div = document.createElement('div');

        // Bouton Détails toujours visible
        const detailsButton = document.createElement('button');
        detailsButton.className = 'btn btn-warning btn-sm me-1';
        detailsButton.innerText = '📋 Détails';
        detailsButton.onclick = () => {
          if (dossierId) this.router.navigate([`/dossier/DossierDetails/${dossierId}`]);
        };
        div.appendChild(detailsButton);

        // Boutons Modifier/Supprimer uniquement si EN_ATTENTE
        if (etat === 'EN_ATTENTE') {
          const editButton = document.createElement('button');
          editButton.className = 'btn btn-sm btn-primary me-1';
          editButton.innerText = '✏️ Modifier';
          editButton.onclick = () => {
            this.confirmUpdateDossier(dossierId, dossier.numeroDossier);
          };

          const deleteButton = document.createElement('button');
          deleteButton.className = 'btn btn-danger btn-sm';
          deleteButton.innerText = '🗑️ Supprimer';
          deleteButton.onclick = () => {
            this.confirmDeleteDossier(dossierId, dossier.numeroDossier);
          };

          div.appendChild(editButton);
          div.appendChild(deleteButton);
        }

        return div;
      }
    }
  ];

  getEtatTextColorStyle(params: any): any {
    if (params.value === 'EN_ATTENTE') {
      return { 'color': '#ffeb3b', 'font-weight': 'bold' };
    } else if (params.value === 'TRAITE') {
      return { 'color': '#4caf50', 'font-weight': 'bold' };
    } else if (params.value === 'EN_TRAITEMENT') {
      return { 'color': '#0d0795', 'font-weight': 'bold' };
    }
    return {};
  }

  defaultColDef = { flex: 1, minWidth: 120, resizable: true };
  paginationPageSize = 20;
  paginationPageSizeSelector = [20, 50, 100];
  selectedType: string = '';

  constructor(
    private dossierService: DossierService,
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getDossiersByType();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  // ========== MÉTHODES DE CONFIRMATION ==========
  
  confirmDeleteDossier(dossierId: number, numeroDossier: string): void {
    this.currentDossierId = dossierId;
    this.numeroDossier = numeroDossier;
    this.deleteConfirmationVisible = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelDeleteDossier(): void {
    this.deleteConfirmationVisible = false;
    this.currentDossierId = null;
    this.numeroDossier = '';
    this.errorMessage = null;
    this.successMessage = null;
  }

  deleteConfirmedDossier(): void {
    if (!this.currentDossierId) return;

    this.dossierService.deleteDossier(this.currentDossierId).subscribe({
      next: () => {
        this.successMessage = `Dossier "${this.numeroDossier}" supprimé avec succès !`;
        setTimeout(() => {
          this.deleteConfirmationVisible = false;
          this.getDossiersByType();
          this.showToast('Suppression réussie', 'success');
        }, 1500);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.errorMessage = 'Erreur lors de la suppression du dossier. Veuillez réessayer.';
        this.showToast('Erreur de suppression', 'error');
      }
    });
  }

  confirmUpdateDossier(dossierId: number, numeroDossier: string): void {
    this.currentDossierId = dossierId;
    this.numeroDossier = numeroDossier;
    this.updateConfirmationVisible = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelUpdateDossier(): void {
    this.updateConfirmationVisible = false;
    this.currentDossierId = null;
    this.numeroDossier = '';
    this.errorMessage = null;
    this.successMessage = null;
  }

  updateConfirmedDossier(): void {
    if (!this.currentDossierId) return;
    
    this.updateConfirmationVisible = false;
    this.router.navigate([`/dossier/edit-dossier/${this.currentDossierId}`]);
  }

  // ========== MÉTHODE TOAST ==========
  
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    // Ajouter au conteneur de toasts
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);

    // Afficher le toast
    const bsToast = new (window as any).bootstrap.Toast(toast, {
      autohide: true,
      delay: 3000
    });
    bsToast.show();

    // Supprimer après fermeture
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  // ========== MÉTHODES DE DONNÉES ==========

  getDossiersByType(): void {
    this.loading = true;
    this.errorMessage = null;

    this.dossierService.getDossiersByType("RECOURS").subscribe(
      (data: any) => {
        let dossiersArray: any[] = [];

        if (Array.isArray(data)) {
          dossiersArray = data;
        } else if (data && data.dossiers && Array.isArray(data.dossiers)) {
          dossiersArray = data.dossiers;
        } else {
          this.rowData = [];
          this.errorMessage = "Erreur: Format de données RECOURS invalide.";
          console.error("❌ Format de données RECOURS invalide :", data);
          this.loading = false;
          return;
        }

        this.rowData = dossiersArray.map((dossier: any) => ({
          id: dossier.id,
          intitule: dossier.intitule,
          numeroDossier: dossier.numeroDossier,
          typePassation: dossier.typePassation,
          dateSoumission: dossier.dateSoumission,
          fileDetails: dossier.fileDetails,
          chargeDossier: dossier.chargeDossier?.name || 'N/A',
          etat: dossier.etat
        }));

        this.loading = false;
      },
      (error) => {
        console.error('❌ Erreur lors de la récupération des dossiers RECOURS :', error);
        this.loading = false;
        this.errorMessage = 'Erreur lors de la récupération des données RECOURS.';
        this.showToast('Erreur de chargement des données', 'error');
      }
    );
  }

  private formatDate(date: string | null): string {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  addActionListeners() {
    const table = document.querySelector("ag-grid-angular");
    if (table) {
      this.renderer.listen(table, "click", (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "A") {
          this.showToast(`Téléchargement de : ${target.innerText}`, 'info');
        }
      });
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target || !target.value) {
      this.filteredData = [...this.rowData];
      return;
    }

    const query = target.value.toLowerCase();

    this.filteredData = this.rowData.filter(dossier =>
      (dossier.numeroDossier && dossier.numeroDossier.toLowerCase().includes(query)) ||
      (dossier.intitule && dossier.intitule.toLowerCase().includes(query)) ||
      (dossier.typePassation && dossier.typePassation.toLowerCase().includes(query)) ||
      (dossier.dateSoumission && this.formatDate(dossier.dateSoumission).toLowerCase().includes(query)) ||
      (dossier.etat && dossier.etat.toLowerCase().includes(query)) ||
      (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query))) ||
      (dossier.chargeDossier && dossier.chargeDossier.toLowerCase().includes(query))
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onTypeChange(): void {
    if (this.selectedType) {
      const encodedType = encodeURIComponent(this.selectedType);
      this.router.navigate([`/dossier/${encodedType}`]);
    }
  }
}