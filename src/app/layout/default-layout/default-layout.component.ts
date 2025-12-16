import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { StorageService } from '../../service/storage-service/storage.service';
import { NgScrollbar } from 'ngx-scrollbar';
import { SidebarComponent, SidebarHeaderComponent, SidebarBrandComponent, SidebarNavComponent, SidebarFooterComponent, SidebarToggleDirective, SidebarTogglerDirective, ShadowOnScrollDirective, ContainerComponent } from '@coreui/angular';
import { DefaultHeaderComponent } from './';
import { getNavItems } from './_nav';
import { INavData } from '@coreui/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
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
}

