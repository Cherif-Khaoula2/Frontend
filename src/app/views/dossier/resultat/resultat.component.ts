import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DossierService } from '../../../service/dossier.service';
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatList, MatListItem } from "@angular/material/list";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTab, MatTabGroup, MatTabLabel } from "@angular/material/tabs";
import { DossierFilesComponent } from "../dossier-files/dossier-files.component";
import { MatOption, MatSelect } from "@angular/material/select";
import { UserService } from "../../../service/user.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-resultat',
  templateUrl: './resultat.component.html',
  styleUrls: ['./resultat.component.scss'],
  standalone: true, // Assuming you want this to be a standalone component
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabGroup,
    MatTab,
    DossierFilesComponent, // Ensure this component is standalone or imported correctly in its module
    MatTabLabel,
    MatSelect,
    MatOption,
  ],
})
export class ResultatComponent implements OnInit {
  // Form for the 'Décision Personnelle' tab
  resultatForm!: FormGroup;
  dossierId!: number;
  resultatExistant: any = null; // Holds the currently saved 'Décision Personnelle'
  isLoading = true; // For loading existing 'Décision Personnelle'

  // Properties for 'Analyse et Vérification' tab - Collaborator Results
  resultats: any[] = []; // Stores results from other collaborators
  loadingResultats: boolean = false;
  errorResultats: string | null = null;
  chargeDossierMap: { [id: number]: string } = {}; // Potentially useful, though `loadResultats` fetches name directly

  // Properties for dossier details
  dossierDetails: any;
  errorMessage: string | null = null;

  // AI Prediction properties for 'Analyse et Vérification' tab
  predictionResultRF: any = null;
  predictionResultSVM: any = null;
  predictionResultxgboost: any = null;
  predictionResultknn: any = null;
  predictionResultAdaBoost: any = null;
  predictionResultNaiveBayes: any = null;
  loadingIA: boolean = false; // Flag to show/hide AI loading spinner

  // List of possible decisions for the 'Décision Personnelle' dropdown
  listeDecisionsPersonnelles = [
    'accepté', // Change to lowercase
    'refusé',  // Change to lowercase
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder, // Used for building `resultatForm`
    private dossierService: DossierService,
    private router: Router,
    private userService: UserService, // To get user details for collaborator results
    private http: HttpClient // For making HTTP requests to your AI API
  ) {
    // Initialize the `resultatForm` for the 'Décision Personnelle' tab
    this.resultatForm = this.fb.group({
      resultat: ['', Validators.required], // Corresponds to 'Décision Personnelle' select
      compteRendu: ['', Validators.required] // Corresponds to 'Compte rendu' textarea
    });
  }

  ngOnInit(): void {
    // Extract dossier ID from the route parameters
    this.dossierId = +this.route.snapshot.paramMap.get('id')!;

    // Load detailed information about the current dossier
    this.loadDossierDetails();

    // Load results (decisions) made by other collaborators for this dossier
    this.loadResultats(this.dossierId);

    // Attempt to load any existing 'Décision Personnelle' for the current user and dossier
    this.dossierService.getResultatByDossierId(this.dossierId).subscribe({
      next: (res) => {
        if (res) {
          this.resultatExistant = res;
          // If an existing decision is found, pre-fill the 'Décision Personnelle' form
          this.resultatForm.patchValue({
            resultat: res.resultat,
            compteRendu: res.compteRendu
          });
        }
        this.isLoading = false; // Finished loading existing result
      },
      error: (err) => {
        // If an error occurs (e.g., no result found), the form remains empty
        this.isLoading = false;
        console.error('Error loading existing personal decision:', err);
      }
    });
  }

  /**
   * Handles the submission of the 'Décision Personnelle' form.
   * This sends the user's personal decision and report to the backend.
   */
  onSubmit(): void {
    if (this.resultatForm.invalid) {
      this.resultatForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
      alert('Veuillez remplir tous les champs requis pour votre décision personnelle.');
      return;
    }

    const resultat = this.resultatForm.value.resultat;
    const compteRendu = this.resultatForm.value.compteRendu;

    // Call the service to add or update the personal decision and report
    this.dossierService.ajouterResultatEtCompteRendu(this.dossierId, resultat, compteRendu).subscribe({
      next: () => {
        alert('✅ Votre décision personnelle et compte rendu ont été ajoutés avec succès !');
        // Optionally, navigate back to the dossier list or refresh the current view
        this.router.navigate(['/dossier']);
      },
      error: (err) => {
        console.error('❌ Erreur lors de l’envoi de votre décision personnelle :', err);
        alert('❌ Erreur lors de l’enregistrement de votre décision personnelle. Veuillez réessayer.');
      }
    });
  }

  /**
   * Loads the comprehensive details of the dossier.
   * This includes general information and specific details based on the dossier's type.
   */
  loadDossierDetails(): void {
    const id = this.dossierId; // Use the already retrieved dossierId
    this.dossierService.getDossierById(id).subscribe({
      next: (data) => {
        this.dossierDetails = data;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des détails du dossier.';
        console.error('❌ Erreur lors du chargement des détails du dossier:', error);
      }
    });
  }

  /**
   * Loads all results (decisions and reports) submitted by *other collaborators*
   * for the current dossier. It enriches these results with user details (name, email).
   * @param id The ID of the dossier.
   */
  loadResultats(id: number): void {
    this.loadingResultats = true;
    this.errorResultats = null;
    this.resultats = []; // Clear previous results

    this.dossierService.getAllResultatsByDossierId(id).subscribe({
      next: (data) => {
        const resultatsAvecInfos: any[] = [];
        if (data.length === 0) {
          this.loadingResultats = false;
          return; // No results to process
        }

        let completedRequests = 0;
        data.forEach((resultat: any) => {
          // Fetch user details for each result's `chargeDossierId`
          this.userService.getUserById(resultat.chargeDossierId).subscribe({
            next: (user) => {
              resultat.chargeDossierName = user.name;
              resultat.chargeDossierEmail = user.email;
              resultatsAvecInfos.push(resultat);
            },
            error: () => {
              // Fallback if user details cannot be fetched
              resultat.chargeDossierName = 'Inconnu';
              resultat.chargeDossierEmail = 'Inconnu';
              resultatsAvecInfos.push(resultat);
            },
            complete: () => {
              completedRequests++;
              // Once all user details are fetched, update the `resultats` array
              if (completedRequests === data.length) {
                this.resultats = resultatsAvecInfos;
                this.loadingResultats = false;
              }
            }
          });
        });
      },
      error: () => {
        this.errorResultats = "Erreur lors du chargement des résultats des collaborateurs.";
        this.loadingResultats = false;
      }
    });
  }

  /**
   * Initiates the AI verification process for the dossier.
   * This method sends relevant dossier details to a Flask API endpoint for machine learning prediction.
   */
  verifyWithIA(): void {
    // Ensure dossier details are loaded before attempting AI verification
    if (!this.dossierDetails || !this.dossierDetails.details) {
      console.error('Dossier details are not loaded for AI verification.');
      alert('Impossible de lancer la vérification IA : les détails du dossier sont manquants.');
      return;
    }

    this.loadingIA = true; // Activate loading spinner for AI section
    // Reset previous AI prediction results
    this.predictionResultRF = null;
    this.predictionResultSVM = null;
    this.predictionResultxgboost = null;
    this.predictionResultknn = null;
    this.predictionResultAdaBoost = null;
    this.predictionResultNaiveBayes = null;

    // Construct the data payload for your Flask AI API.
    // IMPORTANT: The keys in this object MUST exactly match the feature names
    // expected by your Python Flask machine learning model.
    const iaInputData = {
      'Typologie du marché': this.dossierDetails.details.typologidemarche,
      'Montant du contrat': this.dossierDetails.details.montantContrat,
      'Garantie': this.dossierDetails.details.garantie,
      'Délai de réalisation': this.dossierDetails.details.delaiRealisation,
      'Expérience fournisseur': this.dossierDetails.details.experiencefournisseur,
      'Nombre de projets similaires': this.dossierDetails.details.nombredeprojetssimilaires,
      'Notation interne': this.dossierDetails.details.notationinterne,
      'Chiffre d\'affaire': this.dossierDetails.details.chiffreaffaire,
      'Situation fiscale': this.dossierDetails.details.situationfiscale,
      'Fournisseur blacklisté': this.dossierDetails.details.fournisseurblacklist // This is a string ('Oui'/'Non')
    };

    

    // Define the URL of your Flask AI prediction API
    const iaApiUrl = 'http://localhost:5000/predict'; // Make sure this matches your Flask server address and route

    // Send a POST request to the AI API
    this.http.post<any>(iaApiUrl, iaInputData).subscribe({
      next: (response) => {
        // Assign the prediction results from the Flask API response to component properties
        this.predictionResultRF = response.RandomForest;
        this.predictionResultSVM = response.SVM;
        this.predictionResultxgboost = response.XGBoost;
        this.predictionResultknn = response.KNN;
        this.predictionResultAdaBoost = response.AdaBoost;
        this.predictionResultNaiveBayes = response.NaiveBayes;
        this.loadingIA = false; // Deactivate loading spinner
      },
      error: (error) => {
        console.error('Error during AI prediction:', error);
        alert('Erreur lors de la vérification par IA. Veuillez vérifier la console du navigateur et l\'état de votre serveur Flask.');
        this.loadingIA = false; // Deactivate loading spinner even on error
        // Clear previous results in case of an error to prevent misleading information
        this.predictionResultRF = null;
        this.predictionResultSVM = null;
        this.predictionResultxgboost = null;
        this.predictionResultknn = null;
        this.predictionResultAdaBoost = null;
        this.predictionResultNaiveBayes = null;
      }
    });
  }
}
