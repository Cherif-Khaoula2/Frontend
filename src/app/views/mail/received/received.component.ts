import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmailService } from 'src/app/service/email.service';
import { Router } from '@angular/router';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  InputGroupTextDirective,
  RowComponent,
  TableDirective,
  TextColorDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-received',
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    IconDirective,
    FormsModule,
    TableDirective,
    DatePipe,
    InputGroupTextDirective
  ],
  templateUrl: './received.component.html',
  styleUrl: './received.component.scss'
})
export class ReceivedComponent implements OnInit, OnDestroy {
  allEmails: any[] = [];
  emails: any[] = []; // Les emails affichés sur la page actuelle
  selectedEmails: any[] = [];
  searchTerm: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  private routerSubscription: Subscription | undefined;

  constructor(private emailService: EmailService, private router: Router) {}

  ngOnInit(): void {
    this.loademails();
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (this.router.url.startsWith('/mails/details') && event.constructor.name === 'NavigationEnd') {
        this.loademails();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loademails() {
    this.emailService.getemailsrecevoir().subscribe(
      (data: any[]) => {
        this.allEmails = data.map(email => ({ ...email, isSelected: false }));
        this.sortEmailsByDate();
        this.paginateEmails();
      },
      (error) => console.error('Erreur lors du chargement des emails', error)
    );
  }

  openAttachment(filePath: string): void {
    window.open(filePath, '_blank');
  }

  toggleSelect(email: any) {
    email.isSelected = !email.isSelected;
    this.updateSelectedEmails();
  }

  updateSelectedEmails() {
    this.selectedEmails = this.emails.filter((email: { isSelected: boolean }) => email.isSelected);
    console.log('Emails sélectionnés:', this.selectedEmails);
  }

  viewEmailDetails(id: number) {
    this.router.navigate(['/mails/details', id]);
  }

  searchEmails() {
    const filteredEmails = this.allEmails.filter(email =>
      email.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      email.recipient.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.emails = this.paginateArray(filteredEmails, this.pageSize, this.currentPage);
  }

  onSearchTermChange() {
    this.searchTerm = this.searchTerm.toLowerCase();
    this.currentPage = 0; // Reset page on search
    this.searchEmails();
  }

  sortEmailsByDate() {
    this.allEmails.sort((a, b) => {
      // Assurez-vous que vos objets email ont une propriété 'sentAt' au format Date ou ISO string
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

  protected readonly Math = Math;
}
