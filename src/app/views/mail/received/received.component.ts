import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmailService } from 'src/app/service/email.service';
import { Router } from '@angular/router';
import {
  CardBodyComponent,
  CardComponent,
  InputGroupComponent,
  ButtonDirective,
  BadgeComponent,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-received',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    FormsModule,
    DatePipe,
    InputGroupComponent,
    ButtonDirective,
    BadgeComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective
  ],
  templateUrl: './received.component.html',
  styleUrl: './received.component.scss'
})
export class ReceivedComponent implements OnInit, OnDestroy {
  allEmails: any[] = [];
  emails: any[] = [];
  selectedEmails: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  isLoading: boolean = false;
  selectAll: boolean = false;
  
  private routerSubscription: Subscription | undefined;
  private searchSubject: Subject<string> = new Subject();
  private searchSubscription: Subscription | undefined;

  // Options de filtrage
  filterStatus: 'all' | 'read' | 'unread' = 'all';
  sortBy: 'date' | 'sender' | 'subject' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(private emailService: EmailService, private router: Router) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadEmails();
    
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (this.router.url.startsWith('/mails/details') && event.constructor.name === 'NavigationEnd') {
        this.loadEmails();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  setupSearch(): void {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  loadEmails(): void {
    this.isLoading = true;
    this.emailService.getemailsrecevoir().subscribe(
      (data: any[]) => {
        this.allEmails = data.map(email => ({ ...email, isSelected: false }));
        this.applyFilters();
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement des emails', error);
        this.isLoading = false;
      }
    );
  }

  applyFilters(): void {
    let filteredEmails = [...this.allEmails];

    // Filtrer par statut de lecture
    if (this.filterStatus === 'read') {
      filteredEmails = filteredEmails.filter(email => email.isRead);
    } else if (this.filterStatus === 'unread') {
      filteredEmails = filteredEmails.filter(email => !email.isRead);
    }

    // Filtrer par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filteredEmails = filteredEmails.filter(email =>
        email.subject?.toLowerCase().includes(term) ||
        email.content?.toLowerCase().includes(term) ||
        email.recipient?.toLowerCase().includes(term) ||
        email.sender?.toLowerCase().includes(term)
      );
    }

    // Trier les emails
    this.sortEmails(filteredEmails);

    // Calculer la pagination
    this.totalPages = Math.ceil(filteredEmails.length / this.pageSize);
    this.emails = this.paginateArray(filteredEmails, this.pageSize, this.currentPage - 1);
  }

  sortEmails(emails: any[]): void {
    emails.sort((a, b) => {
      let comparison = 0;
      
      switch(this.sortBy) {
        case 'date':
          comparison = new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
          break;
        case 'sender':
          comparison = (a.sender || '').localeCompare(b.sender || '');
          break;
        case 'subject':
          comparison = (a.subject || '').localeCompare(b.subject || '');
          break;
      }
      
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  openAttachment(filePath: string, event: Event): void {
    event.stopPropagation();
    window.open(filePath, '_blank');
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.emails.forEach(email => email.isSelected = this.selectAll);
    this.updateSelectedEmails();
  }

  toggleSelect(email: any, event: Event): void {
    event.stopPropagation();
    email.isSelected = !email.isSelected;
    this.updateSelectedEmails();
    this.selectAll = this.emails.every(e => e.isSelected);
  }

  updateSelectedEmails(): void {
    this.selectedEmails = this.emails.filter(email => email.isSelected);
  }

  viewEmailDetails(id: number): void {
    this.router.navigate(['/mails/details', id]);
  }

  deleteSelectedEmails(): void {
    if (this.selectedEmails.length === 0) return;
    
    if (confirm(`Voulez-vous vraiment supprimer ${this.selectedEmails.length} email(s) ?`)) {
      // Implémentez ici la logique de suppression
    }
  }

  markAsRead(): void {
    if (this.selectedEmails.length === 0) return;
    // Implémentez ici la logique pour marquer comme lu
  }

  markAsUnread(): void {
    if (this.selectedEmails.length === 0) return;
    // Implémentez ici la logique pour marquer comme non lu
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyFilters();
  }

  changeSortBy(sortBy: 'date' | 'sender' | 'subject'): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
    this.applyFilters();
  }

  changeFilterStatus(status: 'all' | 'read' | 'unread'): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  paginateArray(array: any[], pageSize: number, pageNumber: number): any[] {
    const startIndex = pageNumber * pageSize;
    return array.slice(startIndex, startIndex + pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getUnreadCount(): number {
    return this.allEmails.filter(email => !email.isRead).length;
  }

  protected readonly Math = Math;
}