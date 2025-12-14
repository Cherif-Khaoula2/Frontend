import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmailService } from 'src/app/service/email.service';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent
} from "@coreui/angular";
import { DatePipe, CommonModule } from "@angular/common";

interface EmailDetails {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  sentAt: string | Date;
  content: string;
  attachmentPath?: string;
}

@Component({
  selector: 'app-email-details',
  templateUrl: './email-details.component.html',
  standalone: true,
  imports: [
    CardBodyComponent,
    CardHeaderComponent,
    CardComponent,
    ColComponent,
    RowComponent,
    DatePipe,
    CommonModule,
    RouterLink,
    ButtonDirective
  ],
  styleUrls: ['./email-details.component.scss']
})
export class EmailDetailsComponent implements OnInit {
  emailDetails: EmailDetails | null = null;
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService
  ) { }

  ngOnInit(): void {
    this.initializeEmailDetails();
  }

  /**
   * Initialise les détails de l'email à partir de l'ID de la route
   */
  private initializeEmailDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id || isNaN(Number(id))) {
      this.handleError('ID d\'email invalide.');
      return;
    }

    this.loadEmailDetails(Number(id));
  }

  /**
   * Charge les détails de l'email depuis le service
   */
  private loadEmailDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.emailService.getEmailById(id).subscribe({
      next: (data: EmailDetails) => {
        this.emailDetails = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des détails de l\'email:', error);
        this.handleError('Impossible de charger les détails de l\'email. Veuillez réessayer.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Gère les erreurs en affichant un message et éventuellement en redirigeant
   */
  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    
    // Optionnel: redirection automatique après 3 secondes
    // setTimeout(() => {
    //   this.router.navigate(['/mails/received']);
    // }, 3000);
  }

  /**
   * Extrait les initiales depuis l'adresse email
   * @param email - L'adresse email de l'expéditeur
   * @returns Les deux premières lettres en majuscules
   */
  getInitials(email: string): string {
    if (!email || typeof email !== 'string') return '?';
    
    const namePart = email.split('@')[0];
    if (!namePart) return '?';
    
    // Remplace les caractères non alphabétiques
    const cleanName = namePart.replace(/[^a-zA-Z]/g, '');
    
    return cleanName.length >= 2 
      ? cleanName.substring(0, 2).toUpperCase()
      : cleanName.toUpperCase().padEnd(2, '?');
  }

  /**
   * Ouvre la pièce jointe dans un nouvel onglet
   * @param filePath - Le chemin du fichier à ouvrir
   */
  openAttachment(filePath: string): void {
    if (!filePath) {
      this.errorMessage = 'Le chemin de la pièce jointe est invalide.';
      return;
    }

    try {
      // Vérification de sécurité pour les URL
      const url = new URL(filePath, window.location.origin);
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la pièce jointe:', error);
      this.errorMessage = 'Impossible d\'ouvrir la pièce jointe.';
    }
  }

  /**
   * Navigue vers la liste des emails reçus
   */
  goBack(): void {
    this.router.navigate(['/mails/received']);
  }

  /**
   * Détermine si l'email a des données valides
   */
  get hasValidEmail(): boolean {
    return !!this.emailDetails && !!this.emailDetails.subject;
  }

  /**
   * Retourne le nom de fichier depuis le chemin complet
   */
  getAttachmentFileName(filePath: string): string {
    if (!filePath) return 'Fichier';
    
    const parts = filePath.split('/');
    return parts[parts.length - 1] || 'Pièce jointe';
  }
}