import { AfterViewInit, Component, Renderer2 } from "@angular/core";

import { AgGridAngular } from "ag-grid-angular";
import { HttpClient } from "@angular/common/http";
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

  CardBodyComponent,

  CardComponent,

  ColComponent,

  RowComponent,

  TextColorDirective,

} from '@coreui/angular';

import { CommonModule } from "@angular/common";

import { ReactiveFormsModule } from "@angular/forms";

import { Router } from "@angular/router";

import { UserService } from "../../../service/user.service";

import { IconDirective } from "@coreui/icons-angular";



@Component({

  selector: 'app-users',

  standalone: true,

  imports: [AgGridAngular, CommonModule, CardComponent, CardBodyComponent, RowComponent, ColComponent, ReactiveFormsModule, IconDirective],

  templateUrl: './users.component.html',

  styleUrls: ['./users.component.scss'],

})

export class usersComponent implements AfterViewInit {

  rowData: any[] = []; // Données pour le tableau

  columnDefs: ColDef[] = [

    { headerName: 'ID', field: 'id', sortable: true, filter: true, lockPosition: "left", cellClass: "locked-col" },

    { headerName: 'Nom', field: 'name', sortable: true, filter: true },

    { headerName: 'Email', field: 'email', sortable: true, filter: true },

    { headerName: 'Rôles', field: 'roles', sortable: true, filter: true },

    {

      headerName: 'Actions',

      cellRenderer: (params: any) => {

        return `

<button class="btn btn-sm btn-primary edit-btn" data-id="${params.data.id}">Modifier</button>

<button class="btn btn-sm btn-danger delete-btn" data-id="${params.data.id}">Supprimer</button>

`;

      },

      width: 200,

      cellStyle: { textAlign: 'center' },

      lockPosition: "right",

      cellClass: "locked-col"

    }

  ];



  defaultColDef = { flex: 1, minWidth: 100, resizable: true };

  paginationPageSize = 10;

  paginationPageSizeSelector = [1, 5, 10 ,15];



  users: any[] = []; // To store all users for finding by ID

  userToDeleteId: number | null = null;

  userToDeleteName: string = '';

  deleteConfirmationVisible: boolean = false;

  errorMessage: string = '';

  successMessage: string = '';



  constructor(

    private userService: UserService,

    private router: Router,

    private renderer: Renderer2,
    private http: HttpClient

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

           
            return;

          }



          if (target.classList.contains('edit-btn')) {

            this.editUser(numericUserId);

          } else if (target.classList.contains('delete-btn')) {

            this.confirmDeleteUser(numericUserId);

          }

        }

      });

    }

  }



// Mettre à jour un utilisateur

  editUser(userId: number): void {


    this.router.navigate(['/base/edit-user', userId]);

  }



// Préparer la suppression d'un utilisateur

  confirmDeleteUser(userId: number) {

    const user = this.users.find(u => u.id === userId);

    if (user) {

      this.userToDeleteId = userId;

      this.userToDeleteName = user.name;

      this.deleteConfirmationVisible = true;

    }

  }



// Annuler la suppression

  cancelDeleteUser(): void {

    this.userToDeleteId = null;

    this.userToDeleteName = '';

    this.deleteConfirmationVisible = false;

  }



// Confirmer la suppression

  deleteConfirmedUser(): void {

    if (!this.userToDeleteId) return;



    this.userService.deleteUser(this.userToDeleteId).subscribe({

      next: () => {

    
        this.successMessage = `L'utilisateur "${this.userToDeleteName}" a été supprimé avec succès !`;

        this.errorMessage = '';

        this.getUsers(); // Recharger la liste des utilisateurs

        this.userToDeleteId = null;

        this.userToDeleteName = '';

        this.deleteConfirmationVisible = false;

      },

      error: (err) => {


        this.errorMessage = `Erreur lors de la suppression de l'utilisateur "${this.userToDeleteName}". Consultez la console.`;

        this.successMessage = '';

        this.userToDeleteId = null;

        this.userToDeleteName = '';

        this.deleteConfirmationVisible = false;

      }

    });

  }



  getUsers() {

    this.userService.getAllUsers().subscribe({

      next: (data) => {

        this.users = data; // Store all users

        this.rowData = data.map((user: any) => ({

          id: user.id,

          name: user.name,

          email: user.email,

          roles: user.roles.map((r: any) => r.name).join(', ') // Convertir les rôles en texte

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
  this.http.get('https://cmeapp.sarpi-dz.com/pdfapi/generate-pdf', {
    responseType: 'blob', // 🔥 important pour PDF
    withCredentials: true // 🔐 si cookie JWT
  }).subscribe(blob => {
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  }, error => {
    console.error("Erreur génération PDF :", error);
  });
}




  clearSuccessMessage(): void {

    this.successMessage = '';

  }

}
