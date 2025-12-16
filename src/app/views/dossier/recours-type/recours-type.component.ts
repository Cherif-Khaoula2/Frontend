import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TextColorDirective,
  ModalModule, ModalComponent, ModalHeaderComponent, ModalTitleDirective,
  ModalBodyComponent, ModalFooterComponent, ButtonDirective,
  ToastModule, ToastComponent, ToastBodyComponent, ToastHeaderComponent,
  ToasterComponent, ToasterPlacement
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

interface Toast {
  title: string;
  message: string;
  color: string;
  autohide: boolean;
  delay: number;
  visible: boolean;
}

@Component({
  selector: 'app-recours-type',
  templateUrl: './recours-type.component.html',
  styleUrls: ['./recours-type.component.scss'],
  standalone: true,
  imports: [
    AgGridAngular, CommonModule, TextColorDirective, CardComponent,
    CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, FormsModule,
    ModalModule, ModalComponent, ModalHeaderComponent, ModalTitleDirective,
    ModalBodyComponent, ModalFooterComponent, ButtonDirective,
    ToastModule, ToastComponent, ToastBodyComponent, ToastHeaderComponent, ToasterComponent
  ],
})
export class RecoursTypeComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  // Modal de confirmation
  showDeleteModal: boolean = false;
  dossierToDelete: any = null;

  // Toast notifications
  toasts: Toast[] = [];
  toasterPlacement = ToasterPlacement.TopEnd;

  columnDefs: ColDef[] = [
    { headerName: 'Intitulé', field: 'intitule', sortable: true, filter: true, resizable: true },
    { headerName: 'Numéro Dossier', field: 'numeroDossier', sortable: true, filter: true, resizable: true },
    {
      headerName: "État", field: "etat", sortable: true, filter: true,
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
        const fragment = document.createDocumentFragment();
        fragment.appendChild(button);
        return fragment;
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

        const detailsButton = document.createElement('button');
        detailsButton.className = 'btn btn-warning btn-sm me-1';
        detailsButton.innerText = ' Détails';
        detailsButton.onclick = () => {
          if (dossierId) this.router.navigate([`/dossier/DossierDetails/${dossierId}`]);
        };
        div.appendChild(detailsButton);

        if (etat === 'EN_ATTENTE') {
          const editButton = document.createElement('button');
          editButton.className = 'btn btn-sm btn-primary me-1';
          editButton.innerText = 'Modifier';
          editButton.onclick = () => {
            this.router.navigate([`/dossier/edit-dossier/${dossierId}`]);
          };

          const deleteButton = document.createElement('button');
          deleteButton.className = 'btn btn-danger btn-sm';
          deleteButton.innerText = 'Supprimer';
          deleteButton.onclick = () => {
            this.openDeleteModal(dossier);
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

  // Gestion de la modal de confirmation
  openDeleteModal(dossier: any): void {
    this.dossierToDelete = dossier;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.dossierToDelete = null;
  }

  confirmDelete(): void {
    if (this.dossierToDelete && this.dossierToDelete.id) {
      this.dossierService.deleteDossier(this.dossierToDelete.id).subscribe({
        next: () => {
          this.showToast('Succès', 'Le dossier a été supprimé avec succès', 'success');
          this.getDossiersByType();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showToast('Erreur', 'Erreur lors de la suppression du dossier', 'danger');
          this.closeDeleteModal();
        }
      });
    }
  }

  // Gestion des toasts
  showToast(title: string, message: string, color: string = 'info'): void {
    const toast: Toast = {
      title,
      message,
      color,
      autohide: true,
      delay: 4000,
      visible: true
    };
    this.toasts.push(toast);

    // Auto-remove après le délai
    setTimeout(() => {
      this.removeToast(toast);
    }, toast.delay);
  }

  removeToast(toast: Toast): void {
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }

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
          this.showToast('Erreur', 'Format de données invalide', 'danger');
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
        this.showToast('Erreur', 'Erreur lors de la récupération des données', 'danger');
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
          this.showToast('Info', `Téléchargement de : ${target.innerText}`, 'info');
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

  selectedType: string = '';

  onTypeChange(): void {
    if (this.selectedType) {
      const encodedType = encodeURIComponent(this.selectedType);
      this.router.navigate([`/dossier/${encodedType}`]);
    }
  }
}