import { Routes } from '@angular/router';
import {baseGuard} from "../../guards/base.guard";
import {FileLinkRendererComponent} from "./file-link-renderer/file-link-renderer.component";
import {DossierFilesComponent} from "./dossier-files/dossier-files.component";
export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'dossier'
    },
    children: [
      {
       path: 'ajouter-dossier',
       loadComponent: () => import('./ajouter-dossier/ajouter-dossier.component').then(m => m.AjouterDossierComponent),
       canActivate: [baseGuard],
       data: { permissions: ['AJOUTERDOSSIER'] }  
      },
      {
        path: 'edit-dossier/:numeroDossier',
        loadComponent: () => import('./edit-dossier/edit-dossier.component').then(m => m.EditDossierComponent),
        canActivate: [baseGuard] ,
        data: { permissions: ['MODIFIERDOSSIER'] }

},
      {
        path: 'dossier',
        loadComponent: () => import('./dossier/dossier.component').then(m => m.DossierComponent),
        canActivate: [baseGuard],
        data: { permissions: ['GETALLDOSSIER'] }


      },
      {
        path: 'file',
        loadComponent: () => import('./file-link-renderer/file-link-renderer.component').then(m => m.FileLinkRendererComponent),
        canActivate: [baseGuard],


      },
      {
        path: 'dossiers/:id/fichiers',
        loadComponent: () => import('./dossier-files/dossier-files.component').then(m => m.DossierFilesComponent),
        canActivate: [baseGuard],

      },
      {
        path: 'Avenant',
        loadComponent: () => import('./avenant/avenant.component').then(m => m.AvenantComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETALLDOSSIER'] }

      },
      {
        path: 'Attribution',
        loadComponent: () => import('./attribution/attribution.component').then(m => m.AttributionComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETALLDOSSIER'] }

      },
      {
        path: 'Lancement',
        loadComponent: () => import('./lancement/lancement.component').then(m => m.LancementComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETALLDOSSIER'] }

      },
      {
        path: 'Gre',
        loadComponent: () => import('./gre-a-gre/gre-a-gre.component').then(m => m.GreAGreComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETALLDOSSIER'] }

      },
      {
        path: 'Recours',
        loadComponent: () => import('./recours/recours.component').then(m => m.RecoursComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETALLDOSSIER'] }

      },
      {
        path: 'dossierAvenant',
        loadComponent: () => import('./avenant-type/avenant-type.component').then(m => m.AvenantTypeComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETDOSSIERBYUSER'] }

      },
      {
        path: 'dossierAttribution',
        loadComponent: () => import('./attribution-type/attribution-type.component').then(m => m.AttributionTypeComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETDOSSIERBYUSER'] }

      },
      {
        path: 'dossierLancement',
        loadComponent: () => import('./lancement-type/lancement-type.component').then(m => m.LancementTypeComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETDOSSIERBYUSER'] }

      },
      {
        path: 'dossierGreaGre',
        loadComponent: () => import('./gre-a-gre-type/gre-a-gre-type.component').then(m => m.GreAGreTypeComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETDOSSIERBYUSER'] }

      },
      {
        path: 'dossierRecours',
        loadComponent: () => import('./recours-type/recours-type.component').then(m => m.RecoursTypeComponent),
         canActivate: [baseGuard],
        data: { permissions: ['GETDOSSIERBYUSER'] }

      },
      {
        path: 'confirmation',
        loadComponent: () => import('./confirm/confirm.component').then(m => m.ConfirmComponent),
         canActivate: [baseGuard],

      },
      {
        path: 'traitement/:id',
        loadComponent: () => import('./traitement/traitement.component').then(m => m.TraitementComponent),
         canActivate: [baseGuard],

      },
      {
        path: 'resultat/:id',
        loadComponent: () => import('./resultat/resultat.component').then(m => m.ResultatComponent),
         canActivate: [baseGuard],

      },
      {
        path: 'refus',
        loadComponent: () => import('./refus/refus.component').then(m => m.RefusComponent),
         canActivate: [baseGuard],
        data: { permissions: ['getresultat'] }

      },
      {
        path: 'sans-reserve',
        loadComponent: () => import('./sans-reserve/sans-reserve.component').then(m => m.SansReserveComponent),
         canActivate: [baseGuard],
        data: { permissions: ['getresultat'] }

      }, {
        path: 'sans-reserve-susp',
        loadComponent: () => import('./sans-reserve-susp/sans-reserve-susp.component').then(m => m.SansReserveSuspComponent),
         canActivate: [baseGuard],
        data: { permissions: ['getresultat'] }

      }, {
        path: 'avec-reserve-susp',
        loadComponent: () => import('./avec-reserve-susp/avec-reserve-susp.component').then(m => m.AvecReserveSuspComponent),
         canActivate: [baseGuard],
        data: { permissions: ['getresultat'] }

      }, {
        path: 'verifier',
        loadComponent: () => import('./verifier/verifier.component').then(m => m.VerifierComponent),
         canActivate: [baseGuard],
        data: { permissions: ['getresultat'] }

      },
      {
        path: 'dossiers',
        loadComponent: () => import('./dossiers/dossiers.component').then(m => m.DossiersComponent),
         canActivate: [baseGuard],
        data: { permissions: ['addRDV'] }

      },
      {
        path: 'reunion/:id',
        loadComponent: () => import('./reunion/reunion.component').then(m => m.ReunionComponent),
         canActivate: [baseGuard],

      },
      {
        path: 'DossierDetails/:id',
        loadComponent: () => import('./dossier-details/dossier-details.component').then(m => m.DossierDetailsComponent),
         canActivate: [baseGuard],


      },


    ]
  }
];
