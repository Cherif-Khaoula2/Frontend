import {DatePipe, NgTemplateOutlet} from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  AvatarComponent,
  BadgeComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { JwtService } from '../../../service/jwt.service';
import { EmailService } from 'src/app/service/email.service'; // importe ton service email
import { interval } from 'rxjs';



@Component({
    selector: 'app-default-header',
    templateUrl: './default-header.component.html',
  imports: [ContainerComponent,CommonModule, HeaderTogglerDirective, SidebarToggleDirective, IconDirective, HeaderNavComponent, RouterLink, NgTemplateOutlet, DropdownComponent, DropdownToggleDirective, AvatarComponent, DropdownMenuDirective, DropdownHeaderDirective, DropdownItemDirective, BadgeComponent, DropdownDividerDirective, DatePipe]
})
export class DefaultHeaderComponent extends HeaderComponent {
  notifications: any[] = [];
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  constructor(private authService: JwtService,private emailService: EmailService,private router: Router) {
    super();
  }

  sidebarId = input('sidebar1');

  ngOnInit(): void {
    this.loadLastThreeNotifications();
  }

  loadLastThreeNotifications(): void {
    this.emailService.getemailsrecevoir().subscribe(
      (data: any[]) => {
        if (data && data.length > 0) {
          this.notifications = data.slice(-3).reverse(); // ⚡ Garde seulement les 3 dernières notifications
        } else {
          this.notifications = [];
        }
      },
      (error) => {
        console.error('Erreur lors du chargement des notifications', error);
      }
    );
  }


  // Méthode appelée lors du clic sur le bouton de déconnexion
   onLogout(): void {
     this.authService.logout();
   }

  goToProfil(): void {
    this.router.navigate(['/base/profil']);
  }
}
