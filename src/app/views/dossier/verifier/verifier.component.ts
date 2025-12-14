import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService } from "../../../service/dossier.service";
import { CommonModule } from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  CardBodyComponent, CardComponent, ColComponent, RowComponent, TextColorDirective
} from "@coreui/angular";
import {
  ClientSideRowModelModule, ColDef, GridReadyEvent, ModuleRegistry,
  NumberFilterModule, TextFilterModule, ValidationModule, PaginationModule,
  DateFilterModule, NumberEditorModule, TextEditorModule, ColumnAutoSizeModule, CellStyleModule, ICellRendererParams
} from "ag-grid-community";
import {IconDirective} from "@coreui/icons-angular";

ModuleRegistry.registerModules([
  ColumnAutoSizeModule, NumberEditorModule, TextEditorModule, TextFilterModule,
  NumberFilterModule, PaginationModule, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, CellStyleModule
]);

@Component({
  selector: "app-Verifier",
  standalone: true,
  imports: [AgGridAngular, CommonModule, CardComponent, CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule,  FormsModule],
  templateUrl: "./Verifier.component.html",
  styleUrls: ["./Verifier.component.scss"],
})
export class VerifierComponent  implements OnInit, AfterViewInit {
  rowData: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  columnDefs: ColDef[] = [
    { headerName: "Numéro Dossier", field: "numero", sortable: true, filter: true },
    { headerName: "Intitulé", field: "intitule", sortable: true, filter: true },
    { headerName: "Type Passation", field: "typePassation", sortable: true, filter: true },
    { headerName: "État", field: "etat", sortable: true, filter: true,

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
      headerName: 'Traitement',
      field: 'resultat',
      cellRenderer: (params: ICellRendererParams) => {
        const button = document.createElement('button');
        button.className = 'btn btn-warning btn-sm';
        button.innerText = '📝 Decision';
        const dossierId = params.data?.id;

        button.addEventListener('click', () => {
          if (dossierId) {
            this.router.navigate([`/dossier/resultat/${dossierId}`]);
          }
        });

        const fragment = document.createDocumentFragment();
        fragment.appendChild(button);
        return fragment;
      },
      width: 200,
    },
  ];

  getEtatTextColorStyle(params: any): any {
    if (params.value === 'EN_ATTENTE') {
      return { 'color': '#ffeb3b', 'font-weight': 'bold' };
    } else if (params.value === 'VALIDE') {
      return { 'color': '#4caf50', 'font-weight': 'bold' };
    } else if (params.value === 'REJETE') {
      return { 'color': '#f44336', 'font-weight': 'bold' };
    } else if (params.value === 'EN_TRAITEMENT') {
      return { 'color': '#0d0795', 'font-weight': 'bold' };
    }
    return {};
  }

  defaultColDef = { flex: 1, minWidth: 120, resizable: true };
  paginationPageSize = 10;
  paginationPageSizeSelector = [1, 5, 10];

  constructor(private dossierService: DossierService, private router: Router, private renderer: Renderer2 , private http: HttpClient) {}

  ngOnInit(): void {
    this.getDossiers();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  getDossiers(): void {
    this.loading = true;
    this.errorMessage = null;

    this.dossierService.getAllDossierswithout().subscribe({
      next: (data) => {
        // ✅ FIX: Handle null or undefined data
        if (!data || !Array.isArray(data)) {
          console.warn("⚠️ API returned null or invalid data, using empty array");
          this.rowData = [];
          this.filteredData = [];
          this.loading = false;
          return;
        }

        // Adjust the mapping logic here
        this.rowData = data.map(dossier => {
          const mappedRow = {
            numero: dossier.numeroDossier?.toString() || '', // Direct access
            intitule: dossier.intitule || '',              // Direct access
            typePassation: dossier.typePassation || '',    // Direct access
            dateSoumission: dossier.dateSoumission,        // Direct access
            etat: dossier.etat || '',                      // Direct access
            chargeDossierId: dossier.chargeDossierId || null, // Direct access to ID
            fileDetails: dossier.fileDetails,
            dateheurs: dossier.dateheurs, 

            id: dossier.id                                 // Direct access
          };
          return mappedRow;
        });

        this.filteredData = this.rowData.slice();
        this.loading = false;
      },
      error: (err) => {
        console.error("❌ Erreur lors du chargement des dossiers :", err);
        this.errorMessage = "Erreur lors du chargement des dossiers. Veuillez réessayer.";
        this.loading = false;
      }
    });
  }

  private formatDate(date: string | null): string {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
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
    if (!target || !target.value) return;

    const query = target.value.toLowerCase();

    this.filteredData = this.rowData.filter(dossier =>
      (dossier.numero && dossier.numero.toLowerCase().includes(query)) ||
      (dossier.intitule && dossier.intitule.toLowerCase().includes(query)) ||
      (dossier.typePassation && dossier.typePassation.toLowerCase().includes(query)) ||
      (dossier.dateSoumission && this.formatDate(dossier.dateSoumission).toLowerCase().includes(query)) ||
      (dossier.etat && dossier.etat.toLowerCase().includes(query)) ||
      (typeof dossier.fileDetails === 'object' && Object.keys(dossier.fileDetails).some(fileName => fileName.toLowerCase().includes(query)))
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  generatePdfReport() {
    const url = 'https://cmeapp.sarpi-dz.com/pdfapi/generate-dossier-pdf';
    this.http.get(url, {
      responseType: 'blob',
      withCredentials: true // ⬅️ Envoie les cookies JWT
    }).subscribe(blob => {
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    }, error => {
      console.error("Erreur PDF:", error);
      alert("Échec lors de la génération du rapport PDF.");
    });
  }

  selectedType: string = '';
  onTypeChange(): void {
    if (this.selectedType) {
      const encodedType = encodeURIComponent(this.selectedType);
      this.router.navigate([`/dossier/${encodedType}`]);
    }
  }
}