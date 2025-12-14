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
  selector: "app-dossier",
  standalone: true,
  imports: [AgGridAngular, CommonModule, CardComponent, CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, IconDirective, FormsModule],
  templateUrl: "./dossier.component.html",
  styleUrls: ["./dossier.component.scss"],
})
export class DossierComponent implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading = false;
  errorMessage: string | null = null;

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
          const dateHeure = new Date(dateheurs[0].dateHeureReunion);
          return dateHeure.toLocaleString('fr-FR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          });
        }
        return "Pas encore ajouté";
      }
    }
,
    {
      headerName: 'Fichiers',
      field: 'fileDetails',
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value || typeof params.value !== 'object') return '';
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm';
        button.innerText = '📁 Voir';
        const dossierId = params.data?.id;
        button.addEventListener('click', () => {
          this.router.navigate([`/dossier/dossiers/${dossierId}/fichiers`]);
        });
        return button;
      },
      width: 150,
    },
    {
      headerName: 'Action',
      field: 'action',
      cellRenderer: (params: ICellRendererParams) => {
        const button = document.createElement('button');
        button.className = 'btn btn-success btn-sm';
        button.innerText = '🛠️ Traitement';
        const dossierId = params.data?.id;
        button.addEventListener('click', () => {
          if (dossierId) {
            this.dossierService.changerEtatDossier(dossierId, 'EN_TRAITEMENT').subscribe({
              next: () => {
                this.router.navigate([`/dossier/traitement/${dossierId}`]);
              },
              error: (error) => {
                console.error('Erreur lors du changement d\'état', error);
              }
            });
          }
        });
        return button;
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

        // Ici on suppose que dossier est l'objet principal (pas dossier.dossier)
        // Filtrer dossiers sans décision (dossier.decision absent ou vide)
        this.rowData = data
          .filter(dossier => !dossier.decision || dossier.decision.length === 0)
          .map(dossier => ({
            numero: dossier.numeroDossier?.toString() || '',
            intitule: dossier.intitule || '',
            typePassation: dossier.typePassation || '',
            dateSoumission: dossier.dateSoumission,
            dateheurs:dossier.dateheurs,
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
    const table = document.querySelector("ag-grid-angular");
    if (table) {
      this.renderer.listen(table, "click", (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "A") {
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
      (dossier.chargeDossier?.toLowerCase().includes(query)) ||
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
}
