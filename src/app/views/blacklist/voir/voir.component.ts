import { AfterViewInit, Component, Renderer2, ViewChild, ElementRef } from "@angular/core";
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
  ICellRendererParams,
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
  CellStyleModule,
]);

import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TextColorDirective,
  ModalModule
} from '@coreui/angular';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DossierService } from "../../../service/dossier.service";
import { StorageService } from "../../../service/storage-service/storage.service"; // ✅ Importer StorageService
import Swal from "sweetalert2";

@Component({
  selector: 'app-voir',
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ReactiveFormsModule,
    FormsModule,
    ModalModule
  ],
  templateUrl: './voir.component.html',
  styleUrl: './voir.component.scss'
})
export class VoirComponent implements AfterViewInit {

  private apiUrl = "https://cmeapp.sarpi-dz.com/blacklist/blacklist";
  nomFournisseur = '';
  isBlacklisted: boolean | null = null;

  rowData: any[] = [];
  selectedUserId!: number;

  editForm!: FormGroup;
  userPermissions: string[] = [];

  @ViewChild('editModal') editModal!: ElementRef;

  columnDefs: ColDef[] = [];

  defaultColDef = { flex: 1, minWidth: 100, resizable: true };
  paginationPageSize = 20;
  paginationPageSizeSelector = [10,20,50];

  // ✅ Composant personnalisé pour les actions
  private ActionsCellRenderer = (params: ICellRendererParams) => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '5px';
    container.style.justifyContent = 'center';

    // ✅ Vérifier les permissions
    if (this.userPermissions.includes('MODIFIERBLACK')) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-sm btn-primary edit-btn';
      editBtn.textContent = 'Modifier';
      editBtn.setAttribute('data-id', params.data.id);
      container.appendChild(editBtn);
    }

    if (this.userPermissions.includes('DELETEBLACK')) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-danger delete-btn';
      deleteBtn.textContent = 'Supprimer';
      deleteBtn.setAttribute('data-id', params.data.id);
      container.appendChild(deleteBtn);
    }

    if (container.children.length === 0) {
      const noAction = document.createElement('span');
      noAction.className = 'text-muted';
      noAction.textContent = 'Aucune action disponible';
      container.appendChild(noAction);
    }

    return container;
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private dossierService: DossierService,
    private storageService: StorageService // ✅ Injecter StorageService
  ) {
    this.editForm = this.fb.group({
      denomination: ['', Validators.required],
      activite: ['', Validators.required],
      structureDemandeExclusion: ['', Validators.required],
      dateExclusion: ['', Validators.required],
      motifs: ['', Validators.required],
      dureeExclusion: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // ✅ Utiliser StorageService pour récupérer les permissions
    this.userPermissions = this.storageService.getPermissions() || [];
    
    console.log('✅ Permissions chargées:', this.userPermissions);
    console.log('🔍 Nombre de permissions:', this.userPermissions.length);

    // ✅ Initialiser les colonnes APRÈS avoir chargé les permissions
    this.initializeColumns();
    this.getUsers();
  }

  ngAfterViewInit(): void {
    this.addActionListeners();
  }

  // ✅ Méthode pour initialiser les colonnes avec les permissions
  initializeColumns() {
    this.columnDefs = [
      { headerName: 'Nom fournisseur', field: 'denomination', sortable: true, filter: true },
      { headerName: 'Activité', field: 'activite', sortable: true, filter: true },
      { headerName: 'Structure Demande Exclusion', field: 'structureDemandeExclusion', sortable: true, filter: true },
      { headerName: 'Date Exclusion', field: 'dateExclusion', sortable: true, filter: true },
      { headerName: 'Motifs', field: 'motifs', sortable: true, filter: true },
      { headerName: 'Durée Exclusion(Jours)', field: 'dureeExclusion', sortable: true, filter: true },
    ];

    // ✅ N'ajouter la colonne Actions QUE si l'utilisateur a au moins une permission
    const hasModifyPermission = this.userPermissions.includes('MODIFIERBLACK');
    const hasDeletePermission = this.userPermissions.includes('DELETEBLACK');

    if (hasModifyPermission || hasDeletePermission) {
      this.columnDefs.push({
        headerName: 'Actions',
        cellRenderer: this.ActionsCellRenderer,
        width: 200,
        cellStyle: { textAlign: 'center' },
        lockPosition: "right",
        cellClass: "locked-col"
      });
    }
  }

  getAlls(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true });
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

  addActionListeners() {
    const table = document.querySelector('ag-grid-angular');
    if (table) {
      this.renderer.listen(table, 'click', (event: Event) => {
        const target = event.target as HTMLElement;
        const userId = target.getAttribute('data-id');
        if (!userId) return;
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) return;

        if (target.classList.contains('edit-btn')) {
          this.openEditModal(numericUserId);
        }

        if (target.classList.contains('delete-btn')) {
          this.deleteUser(numericUserId);
        }
      });
    }
  }

  openEditModal(userId: number) {
    const user = this.rowData.find(u => u.id === userId);
    if (!user) return;

    this.selectedUserId = userId;
    this.editForm.patchValue(user);

    this.editModal.nativeElement.classList.add('show');
    this.editModal.nativeElement.style.display = 'block';
  }

  closeEditModal() {
    this.editModal.nativeElement.classList.remove('show');
    this.editModal.nativeElement.style.display = 'none';
  }

  submitEdit() {
    if (!this.editForm.valid) return;

    this.http.put(`${this.apiUrl}/${this.selectedUserId}`, this.editForm.value, { withCredentials: true }).subscribe({
      next: () => {
        Swal.fire('Succès', 'Fournisseur modifié avec succès', 'success');
        this.getUsers();
        this.closeEditModal();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de modifier le fournisseur', 'error');
      }
    });
  }

  deleteUser(userId: number) {
    Swal.fire({
      title: 'Confirmer la suppression ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${userId}`, { withCredentials: true }).subscribe({
          next: () => {
            Swal.fire('Supprimé !', 'Le fournisseur a été supprimé.', 'success');
            this.getUsers();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Erreur', 'Impossible de supprimer le fournisseur', 'error');
          }
        });
      }
    });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

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
