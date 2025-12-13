import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { DossierService } from '../../../service/dossier.service';
import Swal from 'sweetalert2';
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { FormsModule} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { Router } from '@angular/router';

@Component({
  selector: 'app-ajouter',
  templateUrl: './ajouter.component.html',
  styleUrls: ['./ajouter.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatFormFieldModule
  ]
})
export class AjouterComponent {
  blacklistForm: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private dossierService: DossierService, private router: Router ) {
    this.blacklistForm = this.fb.group({
      denomination: ['', Validators.required],
      activite: ['', Validators.required],
      structureDemandeExclusion: ['', Validators.required],
      dateExclusion: ['', Validators.required],
      motifs: ['', Validators.required],
      dureeExclusion: [null, [Validators.required, Validators.min(1)]]

    });
  }

  onSubmit() {
    if (this.blacklistForm.valid) {
      Swal.fire({
        title: 'Confirmer l’ajout',
        text: 'Voulez-vous vraiment ajouter ce fournisseur à la blacklist ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, ajouter',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.dossierService.addToBlacklist(this.blacklistForm.value).subscribe({
            next: () => {
              Swal.fire('Succès', 'Fournisseur ajouté à la blacklist avec succès.', 'success').then(() => {
                this.router.navigate(['/blacklist/voir']);
              });
            },
            error: () => {
              Swal.fire('Erreur', 'Une erreur est survenue lors de l’ajout.', 'error');
            }
          });
        }
      });
    } else {
      Swal.fire('Formulaire invalide', 'Veuillez remplir tous les champs requis.', 'error');
    }
  }
}
