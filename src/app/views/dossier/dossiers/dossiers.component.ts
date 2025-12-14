// dossiers.component.ts
import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TextColorDirective
} from "@coreui/angular";

import {
  ClientSideRowModelModule, ColDef, GridReadyEvent, ModuleRegistry,
  NumberFilterModule, TextFilterModule, ValidationModule, PaginationModule,
  DateFilterModule, NumberEditorModule, TextEditorModule, ColumnAutoSizeModule, CellStyleModule, ICellRendererParams
} from "ag-grid-community";

import { IconDirective } from "@coreui/icons-angular";

ModuleRegistry.registerModules([
  ColumnAutoSizeModule, NumberEditorModule, TextEditorModule, TextFilterModule,
  NumberFilterModule, PaginationModule, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, CellStyleModule
]);

@Component({
  selector: "app-dossiers",
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ReactiveFormsModule,
    IconDirective,
    FormsModule
  ],
  templateUrl: "./dossiers.component.html",
  styleUrls: ["./dossiers.component.scss"],
})
export class DossiersComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  isRdvModalOpen = false;
  selectedDossierId: number | null = null;
  rdvDate: string = ''; // Will hold 'YYYY-MM-DD'
  rdvTime: string = ''; // Will hold 'HH:mm'

  // rdvCommentaire is not used in the current backend API, so it's not included in the payload
  // rdvCommentaire: string = ''; // Keep if you use it for other purposes in the template

  columnDefs: ColDef[] = [
    { headerName: "Numéro Dossier", field: "numero", sortable: true, filter: true },
    { headerName: "Intitulé", field: "intitule", sortable: true, filter: true },
    { headerName: "Type Passation", field: "typePassation", sortable: true, filter: true },
    {
      headerName: "État",
      field: "etat",
      sortable: true,
      filter: true,
      cellStyle: (params) => this.getEtatTextColorStyle(params)
    },
    {
      headerName: "Date Soumission",
      field: "dateSoumission",
      sortable: true,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => this.formatDate(params.value),
      valueGetter: (params) => params.data?.dateSoumission ? new Date(params.data.dateSoumission) : null,
    },
    {
      headerName: "Date et heure de Reunion",
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        const dateheurs = params.data?.dateheurs;
        if (dateheurs && dateheurs.length > 0) {
          // Assuming dateHeureReunion from backend is an ISO string like "2025-06-19T10:30:00"
          const dateHeure = new Date(dateheurs[0].dateHeureReunion);
          return dateHeure.toLocaleString('fr-FR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          });
        }
        return "Pas encore ajouté";
      }
    },
    {
      headerName: 'Action',
      field: 'action',
      cellRenderer: (params: ICellRendererParams) => {
        return `<button class="btn btn-primary btn-sm">📅 Rendez-vous</button>`;
      },
      onCellClicked: (params) => {
        this.openRdvModal(params.data.id);
      },
      width: 150,
    }
  ];

  defaultColDef = { flex: 1, minWidth: 120, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];
  selectedType: string = '';

  constructor(private dossierService: DossierService, private router: Router, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.getDossiers();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  getDossiers(): void {
    this.loading = true;
    this.errorMessage = null;

    this.dossierService.getAlllDossiers().subscribe({
      next: (data) => {

        this.rowData = data
          .filter(dossier => !dossier.decision || dossier.decision.length === 0)
          .map(dossier => ({
            numero: dossier.numeroDossier?.toString() || '',
            intitule: dossier.intitule || '',
            typePassation: dossier.typePassation || '',
            dateSoumission: dossier.dateSoumission,
            dateheurs: dossier.dateheurs, // This will contain the 'dateHeureReunion' for display
            etat: dossier.etat || '',
            fileDetails: dossier.fileDetails,
            id: dossier.id
          }));

        this.filteredData = [...this.rowData];
        this.loading = false;
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des dossiers :", err);
        this.errorMessage = "Erreur lors du chargement des dossiers. Veuillez réessayer.";
        this.loading = false;
      }
    });
  }

  getEtatTextColorStyle(params: any): any {
    switch (params.value) {
      case 'EN_ATTENTE': return { 'color': '#ffeb3b', 'font-weight': 'bold' };
      case 'VALIDE': return { 'color': '#4caf50', 'font-weight': 'bold' };
      case 'REJETE': return { 'color': '#f44336', 'font-weight': 'bold' };
      case 'EN_TRAITEMENT': return { 'color': '#0d0795', 'font-weight': 'bold' };
      default: return {};
    }
  }

  private formatDate(date: string | null): string {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("fr-FR", {
      year: "numeric", month: "long", day: "numeric"
    });
  }

  addActionListeners() {
    // Consider using a dedicated cell renderer with Angular components for better event handling
    // or attaching listener directly to the grid API after it's ready.
    // The current approach might be fragile if the DOM structure changes.
    const table = document.querySelector("ag-grid-angular");
    if (table) {
      this.renderer.listen(table, "click", (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "A") { // This seems to be for file links, not the Rendez-vous button
          alert(`Téléchargement de : ${target.innerText}`);
        }
      });
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target?.value?.toLowerCase() || '';

    this.filteredData = this.rowData.filter(dossier =>
      (dossier.numero?.toLowerCase().includes(query)) ||
      (dossier.intitule?.toLowerCase().includes(query)) ||
      (dossier.typePassation?.toLowerCase().includes(query)) ||
      (dossier.dateSoumission && this.formatDate(dossier.dateSoumission).toLowerCase().includes(query)) ||
      (dossier.etat?.toLowerCase().includes(query)) ||
      // (dossier.chargeDossier?.toLowerCase().includes(query)) || // Uncomment if chargeDossier is a field
      (typeof dossier.fileDetails === 'object' &&
        Object.keys(dossier.fileDetails).some(fileName =>
          fileName.toLowerCase().includes(query)))
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  generatePdfReport() {
    window.open('https://cmeapp.sarpi-dz.com/pdfapi/generate-dossier-pdf', '_blank');
  }

  onTypeChange(): void {
    if (this.selectedType) {
      const encodedType = encodeURIComponent(this.selectedType);
      this.router.navigate([`/dossier/${encodedType}`]);
    }
  }

  openRdvModal(dossierId: number) {
    this.selectedDossierId = dossierId;
    this.rdvDate = ''; // Reset for new entry
    this.rdvTime = ''; // Reset for new entry
    this.isRdvModalOpen = true;
  }

  closeRdvModal() {
    this.isRdvModalOpen = false;
    this.selectedDossierId = null;
  }

  submitRdv() {
    if (!this.selectedDossierId) {
      alert("Aucun dossier sélectionné.");
      return;
    }
    if (!this.rdvDate || !this.rdvTime) {
      alert("Merci de remplir la date et l'heure.");
      return;
    }

    // Combine date and time, then convert to ISO 8601 string for backend
    // Example: rdvDate = "2025-06-19", rdvTime = "10:30"
    // combinedDateTime = "2025-06-19T10:30"
    const combinedDateTime = `${this.rdvDate}T${this.rdvTime}`;
    // Convert to a Date object, then to ISO 8601 string (e.g., "2025-06-19T09:30:00.000Z" if in Algiers timezone at 10:30 CET)
    // The `new Date()` constructor with "YYYY-MM-DDTHH:mm" treats it as a local time,
    // and `toISOString()` converts it to UTC. This matches your backend's `Instant.parse()`.
    const dateHeureIso = new Date(combinedDateTime).toISOString();

    const rendezVousData = {
      dateHeureReunion: dateHeureIso
    };

    this.dossierService.ajouterRendezVous(this.selectedDossierId, rendezVousData).subscribe({
      next: (response) => {
        alert("Rendez-vous ajouté avec succès !");
        this.closeRdvModal();
        this.getDossiers(); // Refresh the grid to show the new meeting date
      },
      error: (error) => {
        console.error("Erreur lors de l’ajout du rendez-vous :", error);
        // Improved error message extraction
        const errorMessage = error.error?.error || error.statusText || error.message || 'Veuillez vérifier la console pour plus de détails.';
        alert(`Erreur lors de l’ajout du rendez-vous. Détails: ${errorMessage}`);
      }
    });
  }
}
