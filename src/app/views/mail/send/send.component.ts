import { Component } from '@angular/core';
import { EmailService } from '../../../service/email.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerModule } from '@coreui/angular';

@Component({
  selector: 'app-send',
  imports: [SpinnerModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './send.component.html',
  styleUrl: './send.component.scss'
})
export class SendComponent {
  emailData = { to: '', cc: '', bcc: '', subject: '', text: '' }; // Added cc and bcc
  selectedFile: File | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private emailService: EmailService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  clearFile() {
    this.selectedFile = null;
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  sendEmail() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Prepare email data including cc and bcc
    const emailToSend = { ...this.emailData };

    this.emailService.sendEmail(emailToSend, this.selectedFile || undefined).subscribe({
      next: (response) => {
        console.log('Réponse du serveur :', response);
        this.successMessage = response.message;
        this.resetForm();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
        this.errorMessage = 'Échec de l\'envoi de l\'e-mail. Veuillez réessayer.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  saveDraft() {
    console.log('Fonctionnalité de sauvegarde du brouillon implémentée ici.');
    // Implement your draft saving logic
  }

  discardEmail() {
    this.resetForm();
    console.log('E-mail annulé.');
    // Optionally, navigate away from the compose view
  }

  resetForm() {
    this.emailData = { to: '', cc: '', bcc: '', subject: '', text: '' };
    this.selectedFile = null;
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
