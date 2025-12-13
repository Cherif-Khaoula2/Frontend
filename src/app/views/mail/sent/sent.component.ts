import { Component, OnInit } from '@angular/core';
import { EmailService } from 'src/app/service/email.service';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  TextColorDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from "@angular/router";

@Component({
  selector: 'app-sent',
  imports: [CommonModule, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, IconDirective, ReactiveFormsModule, TableDirective, FormsModule],
  templateUrl: './sent.component.html',
  styleUrl: './sent.component.scss'
})
export class SentComponent implements OnInit {
  allEmails: any[] = [];
  emails: any[] = []; // Les emails affichés sur la page actuelle
  searchTerm: string = '';
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(private emailService: EmailService, private router: Router) {}

  ngOnInit(): void {
    this.loademails();
  }

  loademails() {
    this.emailService.getemailsenvoyer().subscribe(
      (data: any[]) => {
        this.allEmails = data;
        this.sortEmailsByDate();
        this.paginateEmails();
      },
      (error) => console.error('Erreur lors du chargement des emails', error)
    );
  }

  openAttachment(filePath: string): void {
    window.open(filePath, '_blank');
  }

  sortEmailsByDate() {
    this.allEmails.sort((a, b) => {
      const dateA = new Date(a.sentAt);
      const dateB = new Date(b.sentAt);
      return dateB.getTime() - dateA.getTime(); // Tri décroissant (le plus récent en premier)
    });
  }

  paginateEmails() {
    this.emails = this.paginateArray(this.allEmails, this.pageSize, this.currentPage);
  }

  paginateArray(array: any[], pageSize: number, pageNumber: number): any[] {
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
  }

  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.paginateEmails();
    }
  }

  goToNextPage() {
    const totalPages = Math.ceil(this.allEmails.length / this.pageSize);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
      this.paginateEmails();
    }
  }

  searchEmails() {
    const filteredEmails = this.allEmails.filter(email =>
      email.recipient.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.emails = this.paginateArray(filteredEmails, this.pageSize, this.currentPage);
  }

  onSearchTermChange() {
    this.searchTerm = this.searchTerm.toLowerCase();
    this.currentPage = 0;
    this.searchEmails();
  }
  viewEmailDetails(id: number) {
    this.router.navigate(['/mails/details', id]);
  }
  protected readonly Math = Math;
}
