import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { DossierService } from '../../../service/dossier.service';
import { UserService } from '../../../service/user.service';
import { DossierFilesComponent } from '../dossier-files/dossier-files.component'; // <--- Import the new component

import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import { HttpClient } from '@angular/common/http';
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatList, MatListItem} from "@angular/material/list";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";

@Component({
  selector: 'app-traitement',
  standalone: true,
  templateUrl: './traitement.component.html',
  styleUrls: ['./traitement.component.scss'],
  imports: [
    MatSlideToggleModule,
    CommonModule,
    ReactiveFormsModule, // Make sure this is imported for FormGroup and formControlName
    FormsModule,         // Keep this if you use any [(ngModel)] elsewhere
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCard,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatCardHeader,
    MatProgressBar,
    MatSelect,
    MatOption,
    DossierFilesComponent,
    MatTabGroup,
    MatTab,
    MatTabLabel
  ],
})
export class TraitementComponent implements OnInit {
  resultats: any[] = [];
  loadingResultats: boolean = false;
  errorResultats: string | null = null;
  chargeDossierMap: { [id: number]: string } = {};
  dossierDetails: any;
  errorMessage: string | null = null;

  // FormGroups for the stepper steps
  infoFormGroup: FormGroup;
  filesFormGroup: FormGroup;
  doneFormGroup: FormGroup; // This one now includes decision and compteRendu

  listeDecisions  = [
    'Visa sans réserve',
    'Refus de visa',
    'Visa avec réserve suspensive',
    'Visa avec réserve non suspensive',
  ];

  dossierId!: number;

  predictionResultRF: any = null;
  predictionResultSVM: any = null;
  predictionResultxgboost: any = null;
  predictionResultknn: any = null;
  predictionResultAdaBoost: any = null;
  predictionResultNaiveBayes: any = null;
  loadingIA: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private dossierService: DossierService,
    private userService: UserService,
    private _formBuilder: FormBuilder, // Ensure _formBuilder is injected
    private router: Router,
    private http: HttpClient,
  ) {
    // Initialize FormGroups in the constructor
    this.infoFormGroup = this._formBuilder.group({}); // Add any specific controls if needed
    this.filesFormGroup = this._formBuilder.group({}); // Add any specific controls if needed
    this.doneFormGroup = this._formBuilder.group({
      doneCtrl: [false], // Keep this if used for stepper logic
      decisionSelectionnee: ['', Validators.required], // Added for decision dropdown
      compteRendu: [''] // Added for textarea
    });
  }

  ngOnInit(): void {
    this.dossierId = +this.route.snapshot.paramMap.get('id')!;
    this.loadDossierDetails();
    this.loadResultats(this.dossierId);
  }

  /**
   * Handles the submission of the final decision and navigates based on the decision.
   * After successfully submitting the decision, it changes the dossier's state to 'TRAITE'.
   */
  onSubmit() {
    const decision = this.doneFormGroup.get('decisionSelectionnee')?.value;
    const compteRenduValue = this.doneFormGroup.get('compteRendu')?.value;

    if (this.doneFormGroup.invalid) {
      alert('Veuillez sélectionner une décision pour continuer.');
      return;
    }

    // 1. Add the decision to the backend
    this.dossierService.ajouterDecision(this.dossierId, decision, compteRenduValue).subscribe({
      next: (res) => {
        console.log('✅ Décision ajoutée avec succès', res);
        alert('Décision enregistrée.');

        // 2. Change the dossier state to 'TRAITE'
        this.dossierService.changerEtatDossier(this.dossierId, 'TRAITE').subscribe({
          next: (etatRes) => {
            console.log('✅ État du dossier changé à TRAITE avec succès', etatRes);
            alert('L\'état du dossier a été mis à jour en "TRAITE".');

            // 3. Navigate based on the decision after both operations are successful
            switch (decision) {
              case 'Refus de visa':
                this.router.navigate(['/dossier/refus']);
                break;
              case 'Visa avec réserve suspensive':
                this.router.navigate(['/dossier/avec-reserve-susp']);
                break;
              case 'Visa sans réserve':
                this.router.navigate(['/dossier/sans-reserve']);
                break;
              case 'Visa sans réserve sunsponsive': // Typo here, should probably be 'Visa sans réserve non suspensive'
                this.router.navigate(['/dossier/sans-reserve-susp']);
                break;
              default:
                // Default navigation if no specific route for the decision
                this.router.navigate(['/dossier']); // Navigate to general dossier list
                break;
            }

            // Reset the form group after successful submission
            this.doneFormGroup.reset();
          },
          error: (etatErr) => {
            console.error('❌ Erreur lors du changement d\'état du dossier :', etatErr);
            alert('Erreur lors de la mise à jour de l\'état du dossier. La décision a été enregistrée, mais l\'état n\'a pas pu être modifié.');
            // Even if state change fails, you might still want to navigate
            // based on the decision, or handle this error differently.
          }
        });
      },
      error: (err) => {
        console.error('❌ Erreur lors de l’envoi de la décision :', err);
        alert('Erreur lors de l’enregistrement de la décision.');
      }
    });
  }

  /**
   * Loads the details of the dossier from the service.
   */
  loadDossierDetails(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.dossierService.getDossierById(id).subscribe({
      next: (data) => {
        this.dossierDetails = data;
        console.log('✅ Détails du dossier chargés:', this.dossierDetails);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des détails du dossier.';
        console.error('❌ Erreur lors du chargement des détails du dossier:', error);
      }
    });
  }

  /**
   * Triggers the AI verification process for the dossier.
   * Sends dossier details to a Flask API for prediction.
   */
  verifyWithIA() {
    this.loadingIA = true;
    // Reset previous prediction results
    this.predictionResultRF = null;
    this.predictionResultSVM = null;
    this.predictionResultxgboost =null;
    this.predictionResultknn =null;
    this.predictionResultAdaBoost = null;
    this.predictionResultNaiveBayes = null;

    // Prepare dossier data for the AI model
    const dossier = {
      'Typologie du marché': this.dossierDetails?.details?.typologidemarche,
      'Montant du contrat': this.dossierDetails?.details?.montantContrat,
      'Garantie': this.dossierDetails?.details?.garantie ,
      'Délai de réalisation': this.dossierDetails?.details?.delaiRealisation,
      'Expérience fournisseur': this.dossierDetails?.details?.experiencefournisseur,
      'Nombre de projets similaires': this.dossierDetails?.details?.nombredeprojetssimilaires,
      'Notation interne': this.dossierDetails?.details?.notationinterne,
      'Chiffre d\'affaire': this.dossierDetails?.details?.chiffreaffaire,
      'Situation fiscale': this.dossierDetails?.details?.situationfiscale,
      'Fournisseur blacklisté': this.dossierDetails?.details?.fournisseurblacklist
    };
    console.log('Données envoyées à l\'IA :', dossier);

    // Send data to the Flask prediction API
    this.http.post<any>('http://10.16.100.36:5000/predict', dossier).subscribe({
      next: (response) => {
        console.log('Résultats de l\'IA reçus :', response);
        this.predictionResultRF = response.RandomForest;
        this.predictionResultSVM = response.SVM;
        this.predictionResultxgboost = response.XGBoost;
        this.predictionResultknn = response.KNN;
        this.predictionResultAdaBoost= response.AdaBoost;
        this.predictionResultNaiveBayes = response.NaiveBayes;
        this.loadingIA = false;
      },
      error: (err) => {
        console.error('Erreur de prédiction IA :', err);
        this.loadingIA = false;
      }
    });
  }

  /**
   * Loads all results associated with a specific dossier ID,
   * enriching them with user details from the UserService.
   * @param id The ID of the dossier.
   */
  loadResultats(id: number) {
    this.loadingResultats = true;
    this.errorResultats = null;
    this.resultats = [];

    this.dossierService.getAllResultatsByDossierId(id).subscribe({
      next: (data) => {
        const resultatsAvecInfos: any[] = [];
        let completedRequests = 0;

        if (data.length === 0) {
          this.loadingResultats = false;
          return;
        }

        data.forEach((resultat: any) => {
          this.userService.getUserById(resultat.chargeDossierId).subscribe({
            next: (user) => {
              resultat.chargeDossierName = user.name;
              resultat.chargeDossierEmail = user.email;
              resultatsAvecInfos.push(resultat);
            },
            error: () => {
              // Handle cases where user data might not be found
              resultat.chargeDossierName = 'Inconnu';
              resultat.chargeDossierEmail = 'Inconnu';
              resultatsAvecInfos.push(resultat);
            },
            complete: () => {
              completedRequests++;
              if (completedRequests === data.length) {
                this.resultats = resultatsAvecInfos;
                this.loadingResultats = false;
              }
            }
          });
        });
      },
      error: () => {
        this.errorResultats = "Erreur lors du chargement des résultats";
        this.loadingResultats = false;
      }
    });
  }

  /**
   * Navigates back to the dossier list page upon cancellation.
   */
  onCancel(): void {
    console.log('Annulation de la décision, navigation vers /dossier/dossier');
    this.router.navigate(['/dossier/dossier']);
  }
}
