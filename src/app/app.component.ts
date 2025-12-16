import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { delay, filter, map, tap } from 'rxjs/operators';

import { ColorModeService } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { TokenMonitorService } from './service/token-monitor.service';
import { StorageService } from './service/storage-service/storage.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  imports: [RouterOutlet, CommonModule, AgGridModule]
})
export class AppComponent implements OnInit {
  title = 'CMEAPP';

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #titleService = inject(Title);
  readonly #colorModeService = inject(ColorModeService);
  readonly #iconSetService = inject(IconSetService);
  
  // 🔹 Injection des services pour la surveillance JWT
  readonly #tokenMonitor = inject(TokenMonitorService);
  readonly #storage = inject(StorageService);

  constructor() {
    this.#titleService.setTitle(this.title);
    // iconSet singleton
    this.#iconSetService.icons = { ...iconSubset };
    this.#colorModeService.localStorageItemName.set('coreui-free-angular-admin-template-theme-default');
    this.#colorModeService.eventName.set('ColorSchemeChange');
  }

  ngOnInit(): void {
    // 🔹 Démarrer la surveillance du token si l'utilisateur est déjà connecté
    if (this.#storage.isLoggedIn()) {
      this.#tokenMonitor.startMonitoring();
    }

    // Surveiller les événements de navigation
    this.#router.events.pipe(
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }

      // 🔹 Gérer la surveillance du token selon la route
      const currentUrl = evt.url;
      
      if (this.#storage.isLoggedIn() && !currentUrl.includes('/login')) {
        // Démarrer la surveillance si connecté et pas sur la page login
        this.#tokenMonitor.startMonitoring();
      } else if (currentUrl.includes('/login')) {
        // Arrêter la surveillance sur la page login
        this.#tokenMonitor.stopMonitoring();
      }
    });

    // Gestion du thème (votre code existant)
    this.#activatedRoute.queryParams
      .pipe(
        delay(1),
        map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter(theme => ['dark', 'light', 'auto'].includes(theme)),
        tap(theme => {
          this.#colorModeService.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}