import { Component } from '@angular/core';

@Component({
  selector: 'app-notification-button',
  templateUrl: './notification-button.component.html',
  styleUrls: ['./notification-button.component.css']
})
export class NotificationButtonComponent {
  notifications: string[] = [];
  showNotifications = false;

  constructor() {
    // Exemple de notifications
    this.notifications = [
      'Nouveau message reçu',
      'Votre dossier a été approuvé',
      'Mise à jour disponible'
    ];
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
}
