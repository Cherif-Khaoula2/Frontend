import { INavData } from '@coreui/angular';
import { StorageService } from '../../service/storage-service/storage.service';

export function getNavItems(storageService: StorageService): INavData[] {
  const permissions = storageService.getPermissions();
  const navItems: INavData[] = [];

  // Accueil
  navItems.push({
    name: 'Accueil',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
  });

  // Titre du menu
  navItems.push({
    title: true,
    name: 'Menu'
  });

  // MENU DOSSIER CME
  if (
    permissions.includes('GETALLDOSSIER') || 
    permissions.includes('AJOUTERDOSSIER') || 
    permissions.includes('addRDV') || 
    permissions.includes('GETDOSSIERBYUSER') ||
    permissions.includes('getresultat')
  ) {
    const dossierMenu: INavData = {
      name: 'Dossier CME',
      url: '/dossier',
      iconComponent: { name: 'cil-folder' },
      children: [],
    };

    // Ajouter un dossier
    if (permissions.includes('AJOUTERDOSSIER')) {
      dossierMenu.children!.push({
        name: 'Ajouter un dossier',
        url: '/dossier/ajouter-dossier',
        iconComponent: { name: 'cil-plus' }
      });
    }

    // Voir les dossiers (pour GETDOSSIERBYUSER)
    if (permissions.includes('GETDOSSIERBYUSER')) {
      dossierMenu.children!.push({
        name: 'Voir les dossiers',
        url: '/dossier/dossierAttribution',
        iconComponent: { name: 'cil-list' }
      });
    }

    // Voir dossiers (pour addRDV)
    if (permissions.includes('addRDV')) {
      dossierMenu.children!.push({
        name: 'Voir dossiers',
        url: '/dossier/dossiers',
        iconComponent: { name: 'cil-folder-open' }
      });
    }

    // Vérifier dossiers (pour getresultat)
    if (permissions.includes('getresultat')) {
      dossierMenu.children!.push({
        name: 'Dossier CME à vérifier',
        url: '/dossier/verifier',
        iconComponent: { name: 'cil-check' }
      });
    }

    // Dossiers Non Traités
    if (permissions.includes('GETALLDOSSIER') || permissions.includes('getresultat')) {
      dossierMenu.children!.push({
        name: 'Dossiers Non Traités',
        url: '/dossier/dossier',
        iconComponent: { name: 'cil-clock' }
      });
    }

    // Dossiers Traités
    if (permissions.includes('GETALLDOSSIER') || permissions.includes('getresultat')) {
      dossierMenu.children!.push({
        name: 'Dossiers Traités',
        url: '/dossier/sans-reserve',
        iconComponent: { name: 'cil-check-circle' }
      });
    }

    if (dossierMenu.children!.length > 0) {
      navItems.push(dossierMenu);
    }
  }

  // Gestion des utilisateurs
  if (permissions.includes('GETALLUSER') || permissions.includes('AJOUTERUSER')) {
    const userMenu: INavData = {
      name: 'Utilisateurs',
      url: '/base',
      iconComponent: { name: 'cil-people' },
      children: [],
    };

    if (permissions.includes('GETALLUSER')) {
      userMenu.children!.push({
        name: 'Gestion des Utilisateurs',
        url: '/base/users',
        iconComponent: { name: 'cil-user' }
      });
    }

    if (userMenu.children!.length > 0) {
      navItems.push(userMenu);
    }
  }

  // Rôles
  if (
    permissions.includes('GETALLROLE') ||
    permissions.includes('AJOUTERROLE') ||
    permissions.includes('MODIFERROLE')
  ) {
    const roleMenu: INavData = {
      name: 'Rôles',
      url: '/roles',
      iconComponent: { name: 'cil-shield-alt' },
      children: [],
    };

    if (permissions.includes('GETALLROLE')) {
      roleMenu.children!.push({
        name: 'Gestion des rôles',
        url: '/roles/list',
        iconComponent: { name: 'cil-settings' }
      });
    }

    if (roleMenu.children!.length > 0) {
      navItems.push(roleMenu);
    }
  }

  // Blacklist
  if (permissions.includes('GETALLBLACK') || permissions.includes('AJOUTERBLACK')) {
    const blacklistMenu: INavData = {
      name: 'Blacklist',
      url: '/blacklist',
      iconComponent: { name: 'cil-ban' },
      children: [],
    };

    if (permissions.includes('GETALLBLACK')) {
      blacklistMenu.children!.push({
        name: 'Gestion des blacklist',
        url: '/blacklist/voirblacklist',
        iconComponent: { name: 'cil-list' }
      });
    }

    if (permissions.includes('AJOUTERBLACK')) {
      blacklistMenu.children!.push({
        name: 'Ajouter une blacklist',
        url: '/blacklist/ajouterblacklist',
        iconComponent: { name: 'cil-user-x' }
      });
    }

    if (blacklistMenu.children!.length > 0) {
      navItems.push(blacklistMenu);
    }
  }

  // Archives
  if (
    permissions.includes('GETALLDOSSIER') || 
    permissions.includes('getresultat') || 
    permissions.includes('GETDOSSIERBYUSER') || 
    permissions.includes('addRDV') || 
    permissions.includes('AJOUTERBLACK')
  ) { 
    navItems.push({
      name: 'Archives',
      url: '/dossier/Attribution',
      iconComponent: { name: 'cil-archive' },
    });
  }

  return navItems;
}