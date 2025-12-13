import { Component, OnInit } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { DossierService, Dossier } from "../../../service/dossier.service";
import { UserService } from "../../../service/user.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ColDef,
  ModuleRegistry,
  PaginationModule,
  ClientSideRowModelModule,
  DateFilterModule,
  TextFilterModule,
  ICellRendererParams, GridReadyEvent,
} from "ag-grid-community";
import {CardBodyComponent, CardComponent, ColComponent, RowComponent} from "@coreui/angular";
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, finalize, map, catchError, tap } from 'rxjs/operators';
import {Router} from "@angular/router";

ModuleRegistry.registerModules([
  PaginationModule,
  ClientSideRowModelModule,
  DateFilterModule,
  TextFilterModule,
]);

@Component({
  selector: 'app-avec-reserve-susp',
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardBodyComponent,
    CardComponent,
    RowComponent,
    ColComponent,
  ],
  templateUrl: './avec-reserve-susp.component.html',
  styleUrl: './avec-reserve-susp.component.scss'
})
export class AvecReserveSuspComponent implements OnInit {
  dossiers: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  columnDefs: ColDef[] = [
    { headerName: "Numéro Dossier", field: "numeroDossier", sortable: true, filter: true, minWidth: 120 },
    { headerName: "Intitulé", field: "intitule", sortable: true, filter: true, flex: 1 },
    { headerName: "Type Passation", field: "typePassation", sortable: true, filter: true, minWidth: 150 },
    {
      headerName: "État",
      field: "etat",
      sortable: true,
      filter: true,
      cellStyle: (params) => this.getEtatTextColorStyle(params)
    },


    { headerName: "Ajouté par", field: "chargeDossierName", sortable: true, filter: true, minWidth: 150 },
    {
      headerName: "Date Soumission",
      field: "dateSoumission",
      sortable: true,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => this.formatDate(params.value),
      minWidth: 140,
    },

    {
      headerName: "Décisions",
      field: "decisions",
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value?.length) return "<i>Aucune décision</i>";
        return params.value
          .map((dec: any) => {
            const decisionText = dec.decision || "N/A";
            return `<span style="color: #ffd984 ; font-weight: bold;">${decisionText}</span>`;
          })
          .join("<br>");
      },
      minWidth: 80,
      filter: true,
      autoHeight: true
    },

    {
      headerName: "Décision par :",
      field: "decisions",
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value?.length) return "<i>Aucune décision</i>";
        return params.value
          .map((dec: any) => {
            const chargeName = dec.chargeDossierName || "Inconnu";
            return `${chargeName} `;
          })
          .join("<br>");
      },
      minWidth: 80 ,
      filter: true, // Changed from agDateColumnFilter as it's text
      autoHeight: true
    },
    {
      headerName: "date de Décision",
      field: "decisions",
      cellRenderer: (params: ICellRendererParams) => {
        if (!params.value?.length) return "<i>Aucune décision</i>";
        return params.value
          .map((dec: any) => {
            const date = this.formatDate(dec.dateAjout) || "N/A";
            return `  ${date}`;
          })
          .join("<br>");
      },
      minWidth: 80 ,
      filter: "agDateColumnFilter",
      autoHeight: true
    },
    {
      headerName: 'Actions',
      field: 'resultat',
      cellRenderer: (params: ICellRendererParams) => {
        const button = document.createElement('button');
        button.className = 'btn btn-warning btn-sm';
        button.innerText = '📝 Details';
        const dossierId = params.data?.id;

        button.addEventListener('click', () => {
          if (dossierId) {
            this.router.navigate([`/dossier/DossierDetails/${dossierId}`]);
          }
        });

        const fragment = document.createDocumentFragment();
        fragment.appendChild(button);
        return fragment;
      },
      width: 200,
    },


  ];

  defaultColDef = {
    resizable: true,
  };

  constructor(private dossierService: DossierService, private router: Router,private userService: UserService) {}

  ngOnInit(): void {
    this.getDossiersWithVisaAvecReserveSusp();
  }

  getDossiersWithVisaAvecReserveSusp(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.dossierService.getVisaAvecREserveSuspDecisions().pipe(
      tap(initialDossiers => console.log('1. Initial dossiers from API (before enrichment):', JSON.parse(JSON.stringify(initialDossiers)))),
      switchMap((dossiers: Dossier[]) => {
        if (dossiers.length === 0) {
          console.log('2. No dossiers received, returning empty array.');
          return of([]);
        }

        const allEnrichmentObservables: Observable<any>[] = [];

        dossiers.forEach((dossier) => {
          console.log(`3. Processing dossier ${dossier.numeroDossier} (ID: ${dossier.id})`);

          const enrichMainDossier$ = this.getUserNameAndEmail(dossier.chargeDossierId).pipe(
            map(userInfo => {
              dossier.chargeDossierName = userInfo.name;
              dossier.chargeDossierEmail = userInfo.email;
              return dossier;
            }),
            tap(d => console.log(`3.1. Main dossier ${d.numeroDossier} enriched: chargeDossierName=${d.chargeDossierName}`))
          );
          allEnrichmentObservables.push(enrichMainDossier$);

          if (dossier.decisions && dossier.decisions.length > 0) {
            dossier.decisions.forEach((decision: any, index: number) => {
              console.log(`3.2. Decision ${index} for dossier ${dossier.numeroDossier} - chargeDossierId: ${decision.chargeDossierId}`);
              const enrichDecision$ = this.getUserNameAndEmail(decision.chargeDossierId).pipe(
                map(userInfo => {
                  decision.chargeDossierName = userInfo.name;
                  decision.chargeDossierEmail = userInfo.email;
                  return decision;
                }),
                tap(d => console.log(`3.2.1. Decision for dossier ${dossier.numeroDossier} enriched: chargeDossierName=${d.chargeDossierName}`))
              );
              allEnrichmentObservables.push(enrichDecision$);
            });
          }

          if (dossier.resultats && dossier.resultats.length > 0) {
            dossier.resultats.forEach((resultat: any, index: number) => {
              console.log(`3.3. Result ${index} for dossier ${dossier.numeroDossier} - chargeDossierId: ${resultat.chargeDossierId}`);
              const enrichResultat$ = this.getUserNameAndEmail(resultat.chargeDossierId).pipe(
                map(userInfo => {
                  resultat.chargeDossierName = userInfo.name;
                  resultat.chargeDossierEmail = userInfo.email;
                  return resultat;
                }),
                tap(r => console.log(`3.3.1. Result for dossier ${dossier.numeroDossier} enriched: chargeDossierName=${r.chargeDossierName}`))
              );
              allEnrichmentObservables.push(enrichResultat$);
            });
          }
        });

        if (allEnrichmentObservables.length === 0 && dossiers.length > 0) {
          console.log('4. Dossiers present, but no user IDs found for enrichment. Returning original dossiers.');
          return of(dossiers);
        } else if (allEnrichmentObservables.length === 0 && dossiers.length === 0) {
          return of([]);
        }

        console.log(`4. Starting forkJoin for ${allEnrichmentObservables.length} user enrichment observables.`);
        return forkJoin(allEnrichmentObservables).pipe(
          tap(() => console.log('5. All user enrichment observables completed by forkJoin.')),
          map(() => dossiers)
        );
      }),
      finalize(() => {
        this.isLoading = false;
        console.log('6. getDossiersWithVisaRefus finalize block executed. isLoading set to false.');
      })
    ).subscribe({
      next: (enrichedDossiers) => {
        this.dossiers = enrichedDossiers;
        console.log("7. FINAL DOSSERS ASSIGNED TO AG-GRID (check structure for 'chargeDossierName'):", JSON.parse(JSON.stringify(this.dossiers)));
      },
      error: (error: HttpErrorResponse) => {
        console.error("Erreur récupération dossiers Visa refus :", error);
        if (error.status === 0) {
          this.errorMessage = "Impossible de se connecter au serveur. Veuillez vérifier votre connexion.";
        } else if (error.status === 404) {
          this.errorMessage = 'Aucun dossier trouvé avec décision "visa refus".';
        } else {
          this.errorMessage = `Erreur lors du chargement: ${error.message || error.statusText}`;
        }
      },
    });
  }

getEtatTextColorStyle(params: any): any {
  console.log('État value for cell:', params.value); // Add this line
  console.log('Type of value:', typeof params.value); // Add this line

  switch (params.value) {
    case 'EN_ATTENTE': return { 'color': '#ffeb3b', 'font-weight': 'bold' };
    case 'TRAITE': return { 'color': '#4caf50', 'font-weight': 'bold' };
    case 'EN_TRAITEMENT': return { 'color': '#0d0795', 'font-weight': 'bold' };
    default:
      console.warn('Unhandled état value:', params.value); // Log unhandled values
      return {};
  }}
  private getUserNameAndEmail(userId: string | number | undefined | null): Observable<{ name: string, email: string }> {
    if (userId === undefined || userId === null || userId === '') {
      console.warn(`[getUserNameAndEmail] Invalid/empty userId '${userId}'. Returning 'Inconnu'.`);
      return of({ name: 'Inconnu', email: 'Inconnu' });
    }

    const userIdNum = Number(userId);
    if (!isNaN(userIdNum)) {
      return this.userService.getUserById(userIdNum).pipe(
        map(user => {
          console.log(`[getUserNameAndEmail] Fetched user ID ${userIdNum}: '${user.name}'`);
          return { name: user.name, email: user.email };
        }),
        catchError(error => {
          console.warn(`[getUserNameAndEmail] Failed to fetch user for ID ${userIdNum}. Error:`, error);
          return of({ name: 'Inconnu', email: 'Inconnu' });
        })
      );
    } else {
      console.warn(`[getUserNameAndEmail] userId '${userId}' is not a valid number. Returning 'Inconnu'.`);
      return of({ name: 'Inconnu', email: 'Inconnu' });
    }
  }

  private formatDate(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fr-FR");
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
