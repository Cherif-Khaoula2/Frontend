import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { EmailService } from 'src/app/service/email.service';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent
} from "@coreui/angular";
import {DatePipe} from "@angular/common";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-details',
  templateUrl: './email-details.component.html',
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
  styleUrl: './email-details.component.scss'
})
export class EmailDetailsComponent implements OnInit {
  emailDetails: any; // Propriété pour stocker les détails de l'email
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private emailService: EmailService) { }

  ngOnInit(): void {
    // Récupérer l'ID depuis les paramètres de la route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmailDetails(Number(id));
    } else {
      this.errorMessage = 'ID d\'email invalide.';
    }
  }

  loadEmailDetails(id: number) {
    this.emailService.getEmailById(id).subscribe({
      next: (data) => {
        this.emailDetails = data;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des détails de l\'email', error);
        this.errorMessage = 'Erreur lors du chargement des détails de l\'email.';
      }
    });
  }

  openAttachment(filePath: string): void {
    window.open(filePath, '_blank');
  }
}
