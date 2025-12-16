import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { StorageService } from '../../service/storage-service/storage.service';
import { NgScrollbar } from 'ngx-scrollbar';
import { SidebarComponent, SidebarHeaderComponent, SidebarBrandComponent, SidebarNavComponent, SidebarFooterComponent, SidebarToggleDirective, SidebarTogglerDirective, ShadowOnScrollDirective, ContainerComponent } from '@coreui/angular';
import { DefaultHeaderComponent } from './';
import { getNavItems } from './_nav';
import { INavData } from '@coreui/angular';


function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './default-layout.component.html',
    styleUrls: ['./default-layout.component.scss'],
    imports: [
        SidebarComponent,
        SidebarHeaderComponent,
        SidebarBrandComponent,
        RouterLink,
        NgScrollbar,
        SidebarNavComponent,
        SidebarFooterComponent,
        SidebarToggleDirective,
        SidebarTogglerDirective,
        DefaultHeaderComponent,
        ShadowOnScrollDirective,
        ContainerComponent,
        RouterOutlet
    ]
})
export class DefaultLayoutComponent implements OnInit {

  public navItems: INavData[] = [];
  public isAuth = false;

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit(): void {
    this.isAuth = this.storageService.isLoggedIn();
    if (!this.isAuth) {
      this.storageService.clearStorage();
      this.router.navigate(['/login']);
      return;
    }
    this.navItems = getNavItems(this.storageService);
  }

  // 🔹 Ajoute cette méthode pour Angular
  onScrollbarUpdate(state: any): void {
    // Tu peux la laisser vide si tu ne veux rien faire pour l'instant
    // console.log('Scrollbar updated', state);
  }
}
