// edit-dossier.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DossierService } from '../../../service/dossier.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { forkJoin, Subscription, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

interface FichierSupplementaire {
  nom: string;
  file: File | null;
}

interface ExistingFile {
  nomFichier: string;
  fileUrl: string;
}

@Component({
  selector: 'app-edit-dossier',
  templateUrl: './edit-dossier.component.html',
  styleUrls: ['./edit-dossier.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    RouterLink,
  ],
})
export class EditDossierComponent implements OnInit, OnDestroy {
  dossierId: string | null = null;
  dossierForm!: FormGroup;
  passations: string[] = [];
  selectedFichiers: string[] = [];
  fichiersSupplementaires: FichierSupplementaire[] = [];
  existingRequiredFiles: { [key: string]: ExistingFile | null } = {};
  existingAdditionalFiles: { nom: string; url: string }[] = [];
  private subscriptions: Subscription[] = [];
  dossier: any;
  private baseUrl = '/api/dossiers';

  // Variables pour la modale de confirmation
  updateConfirmationVisible: boolean = false;
  numeroDossier: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  fichiersRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: ['Dossier de la consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique'],
    Consultation_Prestataire_de_Lancement: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique'],
    Consultation_Procurement_de_Lancement: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Fiche analytique'],
    APPEL_OFFRE_ATTRIBUTION: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'Situation SAP', 'PV COET', 'PV CEO', 'PV COP Technique', 'PV COP Financier'],
    Consultation_Prestataire_dAttribution: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'Situation SAP', 'PV COET', 'PV COP Technique', 'PV COP Financier'],
    Consultation_Procurement_dAttribution: ['Contrat', 'PVCNR', 'VISA CME', 'Avis d’attribution', 'Décision ad hoc', 'DST', 'Fiche de présentation', 'Lettre d’invitation', 'Offre financière', 'PV Adhoc', 'Situation SAP', 'PV COET', 'PV COP Technique', 'PV COP Financier'],
    GRE_A_GRE: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Rapport circonstancié'],
    AVENANT: ['Dossier de consultation', 'Lettre d’opportunité', 'Fiche de validation', 'Rapport circonstancié', 'Contrat'],
    RECOURS: ['Dossier de consultation', 'Lettre d’opportunité', 'Cahier des charges', 'Offre']
  };

  DonneeRequis: { [key: string]: string[] } = {
    APPEL_OFFRE_LANCEMENT: [
      'typologidemarche',
      'garantie',
      'montantEstime',
      'budgetEstime',
      'delaiRealisation',
    ],
    Consultation_Prestataire_de_Lancement: [
      'typologidemarche',
      'garantie',
      'montantEstime',
      'budgetEstime',
      'delaiRealisation',
    ],
    Consultation_Procurement_de_Lancement: [
      'typologidemarche',
      'garantie',
      'montantEstime',
      'budgetEstime',
      'delaiRealisation',
    ],
    APPEL_OFFRE_ATTRIBUTION: [
      'nomFournisseur',
      'montantContrat',
      'dureeContrat',
      'delaiRealisation',
      'typologidemarche',
      'garantie',
      'experiencefournisseur',
      'nombredeprojetssimilaires',
      'notationinterne',
      'chiffreaffaire',
      'situationfiscale',
      'fournisseurblacklist',
      'typefournisseur',
      'fournisseurEtrangerInstallationPermanente',
      'originePaysNonDoubleImposition'
    ],
    Consultation_Prestataire_dAttribution: [
      'nomFournisseur',
      'montantContrat',
      'dureeContrat',
      'delaiRealisation',
      'typologidemarche',
      'garantie',
      'experiencefournisseur',
      'nombredeprojetssimilaires',
      'notationinterne',
      'chiffreaffaire',
      'situationfiscale',
      'fournisseurblacklist',
      'typefournisseur',
      'fournisseurEtrangerInstallationPermanente',
      'originePaysNonDoubleImposition',
    ],
    Consultation_Procurement_dAttribution: [
      'nomFournisseur',
      'montantContrat',
      'dureeContrat',
      'delaiRealisation',
      'typologidemarche',
      'garantie',
      'experiencefournisseur',
      'nombredeprojetssimilaires',
      'notationinterne',
      'chiffreaffaire',
      'situationfiscale',
      'fournisseurblacklist',
      'typefournisseur',
      'fournisseurEtrangerInstallationPermanente',
      'originePaysNonDoubleImposition',
    ],
    GRE_A_GRE: ['montantEstime',
      'budgetEstime',
      'dureeContrat',
      'delaiRealisation'],
    AVENANT: [
      'numeroContrat',
      'dateSignatureContrat',
      'dureeContrat',
      'dateExpirationContrat',
      'montantContrat',
      'objetAvenant',
      'montantAvenant',
      'dureeAvenant',
      'garantie',
    ],
    RECOURS: [],
  };

  champLabels: { [key: string]: string } = {

    montantEstime: 'Montant Estimé',
    budgetEstime: 'Budget Estimé',
    dureeContrat: 'Durée du Contrat',
    delaiRealisation: 'Delai de Réalisation(Jours)',
    nomFournisseur: 'Nom du Fournisseur',
    montantContrat: 'Montant du Contrat',
    numeroContrat: 'Numéro du Contrat',
    dateSignatureContrat: 'Date de Signature',
    dateExpirationContrat: 'Date d’Expiration',
    objetAvenant: 'Objet de l’Avenant',
    montantAvenant: 'Montant de l’Avenant',
    dureeAvenant: 'Durée de l’Avenant',
    typologidemarche: 'Typologie du marché',
    situationfiscale: 'Situation Fiscale',
    fournisseurblacklist: 'Fournisseur Blacklisté',
    typefournisseur: 'Type de Fournisseur',
    garantie: 'Garantie',
    experiencefournisseur: 'Expérience du Fournisseur',
    nombredeprojetssimilaires: 'Nombre de Projets Similaires',
    notationinterne: 'Notation Interne',
    chiffreaffaire: "Chiffre d'Affaires",
  };


  typologidemarcheOptions: string[] = ['Service', 'Fournitures', 'Travaux', 'Etude'];
  garantieOptions: string[] = ['Aucune', 'Retenu', 'Caution'];
  situationFiscaleOptions: string[] = ['Conforme', 'Non conforme'];
  blacklistOptions: string[] = ['Oui', 'Non'];
  typefournisseurOptions: string[] = ['Local', 'ETRANGER'];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private dossierService: DossierService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.paramMap.get('numeroDossier');
    if (!this.dossierId) {
      console.error("Paramètre 'numeroDossier' manquant dans l'URL");
      this.router.navigate(['/dossiers']);
      return;
    }

    this.dossierForm = this.fb.group({
      numeroDossier: ['', Validators.required],
      intitule: ['', Validators.required],
      typePassation: ['', Validators.required],
      fichiers: this.fb.array([]),
      nomFichierSuppl: [''],
      typefournisseur: [''],
      fournisseurEtrangerInstallationPermanente: [false],
      originePaysNonDoubleImposition: [false],
    });

    forkJoin({
      passations: this.dossierService.getPassations(),
      dossierData: this.dossierService.getDossierById(parseInt(this.dossierId, 10)).pipe(
        switchMap(dossierResponse => {
          this.dossier = dossierResponse.dossier;
          this.numeroDossier = this.dossier.numeroDossier; // Stocker le numéro pour la modale
          
          this.dossierForm.patchValue({
            numeroDossier: this.dossier.numeroDossier,
            intitule: this.dossier.intitule,
            typePassation: this.dossier.typePassation
          });

          this.selectedFichiers = this.fichiersRequis[this.dossier.typePassation] || [];
          const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
          fichiersArray.clear();
          this.existingRequiredFiles = {};

          this.selectedFichiers.forEach((fileNom) => {
            const existingFileUrl = dossierResponse.fileDetails?.[fileNom];
            this.existingRequiredFiles[fileNom] = existingFileUrl ? { nomFichier: fileNom, fileUrl: existingFileUrl } : null;
            fichiersArray.push(this.fb.control(null));
          });

          this.existingAdditionalFiles = [];
          if (dossierResponse.fileDetails) {
            Object.keys(dossierResponse.fileDetails)
              .filter(key => !this.selectedFichiers.includes(key))
              .forEach(key => {
                this.existingAdditionalFiles.push({ nom: key, url: dossierResponse.fileDetails![key] });
                fichiersArray.push(this.fb.control(null));
              });
          }

          this.onTypePassationChange(this.dossier.typePassation, dossierResponse);
          return of(dossierResponse);
        })
      )
    }).subscribe({
      next: (data) => {
        this.passations = data.passations;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données', error);
        this.showToast('Erreur lors du chargement des données', 'error');
        this.router.navigate(['/dossiers']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== MÉTHODES DE CONFIRMATION ==========

  confirmUpdateDossier(): void {
    if (this.dossierForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      this.showToast('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    this.updateConfirmationVisible = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelUpdateDossier(): void {
    this.updateConfirmationVisible = false;
    this.errorMessage = null;
    this.successMessage = null;
  }

  updateConfirmedDossier(): void {
    const formData = new FormData();
    formData.append('numeroDossier', this.dossierForm.value.numeroDossier);
    formData.append('intitule', this.dossierForm.value.intitule);
    formData.append('typePassation', this.dossierForm.value.typePassation);

    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    fichiersArray.controls.forEach((control, index) => {
      const file = control.value;
      const requiredFileName = this.selectedFichiers[index];
      if (file) {
        formData.append('files', file, requiredFileName);
      }
    });

    this.fichiersSupplementaires.forEach(fichier => {
      if (fichier.file) {
        formData.append('files', fichier.file, fichier.nom);
      }
    });

    this.existingAdditionalFiles.forEach(existingFile => {
      const isModified = this.fichiersSupplementaires.some(f => f.nom === existingFile.nom && f.file !== null) ||
        fichiersArray.controls[this.selectedFichiers.length + this.existingAdditionalFiles.findIndex(ef => ef.nom === existingFile.nom)]?.value !== null;
      if (!isModified) {
        formData.append('existingFileNames', existingFile.nom);
      }
    });

    const champsSpecifiques = this.DonneeRequis[this.dossierForm.value.typePassation] || [];
    Object.keys(this.dossierForm.controls)
      .filter(key => champsSpecifiques.includes(key))
      .forEach(key => {
        formData.append(key, this.dossierForm.value[key]);
      });

    this.dossierService.updateDossier(parseInt(this.dossierId!, 10), formData).subscribe({
      next: () => {
        this.successMessage = `Dossier "${this.numeroDossier}" modifié avec succès !`;
        
        setTimeout(() => {
          this.updateConfirmationVisible = false;
          this.showToast(`Dossier "${this.numeroDossier}" modifié avec succès`, 'success');
          
          setTimeout(() => {
            this.router.navigate(['/dossier/dossierAttribution']);
          }, 1000);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du dossier', err);
        this.errorMessage = 'Erreur lors de la mise à jour du dossier. Veuillez réessayer.';
        this.showToast('Erreur lors de la mise à jour du dossier', 'error');
      }
    });
  }

  // ========== MÉTHODE TOAST ==========

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
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

    let toastContainer = document.querySelector('.toast-container') as HTMLElement;
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    const bsToast = new (window as any).bootstrap.Toast(toast, {
      autohide: true,
      delay: 3000
    });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  // ========== AUTRES MÉTHODES ==========

  onTypePassationChange(type: string, existingDossier?: any) {
    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    const existingAdditionalControls = fichiersArray.controls.slice(this.selectedFichiers.length + this.existingAdditionalFiles.length);
    fichiersArray.clear();
    this.selectedFichiers = this.fichiersRequis[type] || [];

    this.selectedFichiers.forEach((fileNom) => {
      const existingFileUrl = existingDossier?.fileDetails?.[fileNom];
      this.existingRequiredFiles[fileNom] = existingFileUrl ? { nomFichier: fileNom, fileUrl: existingFileUrl } : null;
      fichiersArray.push(this.fb.control(null));
    });

    this.existingAdditionalFiles.forEach(() => {
      fichiersArray.push(this.fb.control(null));
    });

    existingAdditionalControls.forEach(control => fichiersArray.push(control));

    const anciensChamps = Object.keys(this.dossierForm.controls).filter(
      champ => !['numeroDossier', 'intitule', 'typePassation', 'fichiers', 'nomFichierSuppl'].includes(champ)
    );
    anciensChamps.forEach(champ => this.dossierForm.removeControl(champ));

    const champsSpecifiques = this.DonneeRequis[type] || [];
    champsSpecifiques.forEach(champ => {
      const initialValue = existingDossier?.details?.[champ] || '';
      const validators = this.isCheckbox(champ) ? [] : [Validators.required];
      this.dossierForm.addControl(champ, this.fb.control(initialValue, validators));
    });
    this.dossierForm.updateValueAndValidity();
  }

  isCheckbox(champ: string): boolean {
    return ['fournisseurEtrangerInstallationPermanente', 'originePaysNonDoubleImposition'].includes(champ);
  }

  ajouterFichierSupplementaire() {
    const nomFichier = this.dossierForm.get('nomFichierSuppl')?.value;
    if (nomFichier && nomFichier.trim() !== '') {
      this.fichiersSupplementaires = [...this.fichiersSupplementaires, { nom: nomFichier.trim(), file: null }];
      this.dossierForm.patchValue({ nomFichierSuppl: '' });
      const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
      fichiersArray.push(this.fb.control(null));
    } else {
      this.showToast('Veuillez entrer un nom pour le fichier supplémentaire', 'error');
    }
  }

  onFileSelect(event: any, index: number) {
    const file = event.target.files[0];
    const fichiersArray = this.dossierForm.get('fichiers') as FormArray;
    if (file) {
      if (index < this.selectedFichiers.length) {
        fichiersArray.at(index).setValue(file);
      } else if (index < this.selectedFichiers.length + this.fichiersSupplementaires.length) {
        this.fichiersSupplementaires[index - this.selectedFichiers.length].file = file;
      }
      this.dossierForm.markAsDirty();
      this.dossierForm.updateValueAndValidity();
    }
  }

  onTypeFournisseurChangeEdit(type: string) {
    if (type === 'Local') {
      this.dossierForm.patchValue({
        fournisseurEtrangerInstallationPermanente: false,
        originePaysNonDoubleImposition: false
      });
    }
  }

  onSubmit() {
    this.confirmUpdateDossier();
  }
}