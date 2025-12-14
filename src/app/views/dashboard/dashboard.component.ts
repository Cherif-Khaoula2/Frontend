import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartData, ChartDataset, ChartOptions, Color } from 'chart.js';

import { ChartjsComponent } from '@coreui/angular-chartjs';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StorageService } from '../../service/storage-service/storage.service'; // Assurez-vous que le chemin est correct

interface BarChartData extends ChartData<'bar'> {
  labels: string[];
  datasets: (ChartDataset<'bar'> & {
    label: string;
    backgroundColor: Color | Color[];
    data: number[];
  })[];
}

interface DoughnutChartData extends ChartData<'doughnut'> {
  datasets: (ChartDataset<'doughnut'> & {
    backgroundColor: string[];
    data: number[];
  })[];
  labels?: string[]; // Make labels optional for DoughnutChartData as per your usage
}

interface UserRoleStat {
  role: string;
  count: number;
}

interface DecisionStatsResponse {
  [key: string]: number; // Define the structure for decision counts
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [ChartjsComponent , CommonModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dossiers Chart Data and Options
  data: DoughnutChartData = {
    labels: ['TRAITE', 'EN_ATTENTE', 'EN_TRAITEMENT'],
    datasets: [
      {
        backgroundColor: ['#008000', '#FFFF00', '#87CEEB'], // Vert (TRAITE), Jaune (EN_ATTENTE), Bleu Ciel (EN_TRAITEMENT)
        data: []
      }
    ]
  };
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  // Users by Role Chart Data and Options
  usersByRoleData: BarChartData = {
    labels: [],
    datasets: [
      {
        label: 'Nombre d\'utilisateurs',
        backgroundColor: '#63c2de',
        data: []
      }
    ]
  };
  usersByRoleChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value;
            }
            return '';
          },
          stepSize: 1, // Ensure only whole numbers are displayed
        },
      },
    },
  };

  // User-Specific Dossiers Chart Data and Options
  userDossiersData: DoughnutChartData = {
    labels: ['TRAITE', 'EN_ATTENTE', 'EN_TRAITEMENT'],
    datasets: [
      {
        backgroundColor: ['#008000', '#FFFF00', '#87CEEB'], // Vert (TRAITE), Jaune (EN_ATTENTE), Bleu Ciel (EN_TRAITEMENT)
        data: []
      }
    ]
  };
  userDossiersChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  // Decision Chart Data and Options
  decisionData: DoughnutChartData = {
    labels: [], // Initialize with an empty array for labels
    datasets: [
      {
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#2196F3'], // Green, Amber, Red, Blue
        data: []
      }
    ]
  };
  decisionChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  canViewUserRoles: boolean = false;
  canViewDossierStats: boolean = false;
  canViewUserDossiersStats: boolean = false;
  canViewDecisionStats: boolean = false; // New permission flag

  totalDossiers: number = 0;
  pourcentageTraite: number = 0;
  pourcentageEnAttente: number = 0;
  pourcentageEnTraitement: number = 0;
  totalUsers: number = 0;
  totalUserDossiers: number = 0;
  pourcentageUserTraite: number = 0;
  pourcentageUserEnAttente: number = 0;
  pourcentageUserEnTraitement: number = 0;
  totalDecisions: number = 0; // New total for decisions
  decisionCounts: { [decision: string]: number } = {}; // To store individual decision counts
  pourcentageVisaSansReserve: number = 0;
  pourcentageVisaAvecReserveSuspensive: number = 0;
  pourcentageRefusDeVisa: number = 0;
  pourcentageVisaAvecReserveNonSuspensive: number = 0;

  usersByRoleCounts: { [role: string]: number } = {};
  private ngUnsubscribe = new Subject<void>();

  @ViewChild('chartComponentDossiers') chartComponentDossiers!: ChartjsComponent;
  @ViewChild('chartComponentRoles') chartComponentRoles!: ChartjsComponent;
  @ViewChild('chartComponentUserDossiers') chartComponentUserDossiers!: ChartjsComponent;
  @ViewChild('chartComponentDecisions') chartComponentDecisions!: ChartjsComponent; // New ViewChild

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const permissions = this.storageService.getPermissions();
    this.canViewUserRoles = permissions.includes('GETALLROLE');
    this.canViewDossierStats = permissions.includes('GETALLDOSSIER') || permissions.includes('getresultat') || permissions.includes('GETDOSSIERBYUSER') || permissions.includes('addRDV');
    // Check for decision stats permission - same as dossier stats for now
    this.canViewDecisionStats = permissions.includes('GETALLDOSSIER') || permissions.includes('getresultat') || permissions.includes('GETDOSSIERBYUSER');

    if (this.canViewDossierStats) {
      this.fetchDossierStats();
    }
    if (this.canViewUserRoles) {
      this.fetchUsersByRoleStats();
    }
    if (this.canViewUserDossiersStats) {
      this.fetchUserDossierStats();
    }
    if (this.canViewDecisionStats) { // Fetch decision stats if authorized
      this.fetchDecisionStats();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  fetchDossierStats(): void {
    this.http.get<any>('/').pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (response && typeof response === 'object') {
          this.data.datasets[0].data = [
            response.TRAITE || 0,
            response.EN_ATTENTE || 0,
            response.EN_TRAITEMENT || 0
          ];
          this.calculateDossierAnalysis();
          this.updateDossierChart();
        } else {
          console.error('Réponse des statistiques des dossiers invalide:', response);
          this.totalDossiers = 0;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Erreur lors de la récupération des statistiques des dossiers', error);
        this.totalDossiers = 0;
        this.cdr.detectChanges();
      }
    );
  }

  fetchUsersByRoleStats(): void {
    this.http.get<UserRoleStat[]>('https://cmeapp.sarpi-dz.com/api/user/statistics/users-by-role', { withCredentials: true }).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          this.usersByRoleData.labels = response.map(stat => stat.role);
          this.usersByRoleData.datasets[0].data = response.map(stat => stat.count);
          this.calculateUserRoleAnalysis(response);
          this.updateUsersByRoleChart();
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Erreur lors de la récupération des statistiques des utilisateurs par rôle', error);
        }
      );
  }

  fetchUserDossierStats(): void {
    this.http.get<any>('/by-user', { withCredentials: true}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (response && typeof response === 'object') {
          this.userDossiersData.datasets[0].data = [
            response.TRAITE || 0,
            response.EN_ATTENTE || 0,
            response.EN_TRAITEMENT || 0
          ];
          this.calculateUserDossierAnalysis();
          this.updateUserDossierChart();
        } else {
          console.error('Réponse des statistiques des dossiers utilisateur invalide:', response);
          this.totalUserDossiers = 0;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Erreur lors de la récupération des statistiques des dossiers par utilisateur', error);
        this.totalUserDossiers = 0;
        this.cdr.detectChanges();
      }
    );
  }

  fetchDecisionStats(): void {
    this.http.get<DecisionStatsResponse>('https://cmeapp.sarpi-dz.com/dossiers/api/decisions/counts').pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (response && typeof response === 'object') {
          this.decisionData.labels = Object.keys(response);
          this.decisionData.datasets[0].data = Object.values(response);
          this.calculateDecisionAnalysis();
          this.updateDecisionChart();
        } else {
          console.error('Réponse des statistiques des décisions invalide:', response);
          this.totalDecisions = 0;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Erreur lors de la récupération des statistiques des décisions', error);
        this.totalDecisions = 0;
        this.cdr.detectChanges();
      }
    );
  }

  calculateUserDossierAnalysis(): void {
    const data = this.userDossiersData.datasets[0].data;
    this.totalUserDossiers = data.reduce((sum, value) => sum + value, 0);
    if (this.totalUserDossiers > 0) {
      this.pourcentageUserTraite = (data[0] / this.totalUserDossiers) * 100;
      this.pourcentageUserEnAttente = (data[1] / this.totalUserDossiers) * 100;
      this.pourcentageUserEnTraitement = (data[2] / this.totalUserDossiers) * 100;
    } else {
      this.pourcentageUserTraite = 0;
      this.pourcentageUserEnAttente = 0;
      this.pourcentageUserEnTraitement = 0;
    }
  }

  calculateUserRoleAnalysis(data: UserRoleStat[]): void {
    this.totalUsers = data.reduce((sum, stat) => sum + stat.count, 0);
    this.usersByRoleCounts = data.reduce((acc: { [key: string]: number }, stat) => {
      acc[stat.role] = stat.count;
      return acc;
    }, {});
  }

  calculateDossierAnalysis(): void {
    const data = this.data.datasets[0].data;
    this.totalDossiers = data.reduce((sum, value) => sum + value, 0);
    if (this.totalDossiers > 0) {
      this.pourcentageTraite = (data[0] / this.totalDossiers) * 100;
      this.pourcentageEnAttente = (data[1] / this.totalDossiers) * 100;
      this.pourcentageEnTraitement = (data[2] / this.totalDossiers) * 100;
    } else {
      this.pourcentageTraite = 0;
      this.pourcentageEnAttente = 0;
      this.pourcentageEnTraitement = 0;
    }
  }

  calculateDecisionAnalysis(): void {
    const data = this.decisionData.datasets[0].data;
    const labels = this.decisionData.labels; // Labels are guaranteed to be string[] by now

    this.totalDecisions = data.reduce((sum, value) => sum + value, 0);

    this.decisionCounts = {};
    if (labels) { // Check if labels exist before iterating
      labels.forEach((label, index) => {
        this.decisionCounts[label] = data[index];
      });
    }

    if (this.totalDecisions > 0) {
      this.pourcentageVisaSansReserve = (this.decisionCounts['Visa sans réserve'] || 0) / this.totalDecisions * 100;
      this.pourcentageVisaAvecReserveSuspensive = (this.decisionCounts['Visa avec réserve suspensive'] || 0) / this.totalDecisions * 100;
      this.pourcentageRefusDeVisa = (this.decisionCounts['Refus de visa'] || 0) / this.totalDecisions * 100;
      this.pourcentageVisaAvecReserveNonSuspensive = (this.decisionCounts['Visa avec réserve non suspensive'] || 0) / this.totalDecisions * 100;
    } else {
      this.pourcentageVisaSansReserve = 0;
      this.pourcentageVisaAvecReserveSuspensive = 0;
      this.pourcentageRefusDeVisa = 0;
      this.pourcentageVisaAvecReserveNonSuspensive = 0;
    }
  }

  updateDossierChart(): void {
    if (this.chartComponentDossiers && this.chartComponentDossiers.chart) {
      this.chartComponentDossiers.chart.update();
    }
  }

  updateUsersByRoleChart(): void {
    if (this.chartComponentRoles && this.chartComponentRoles.chart) {
      this.chartComponentRoles.chart.update();
    }
  }

  updateUserDossierChart(): void {
    if (this.chartComponentUserDossiers && this.chartComponentUserDossiers.chart) {
      this.chartComponentUserDossiers.chart.update();
    }
  }

  updateDecisionChart(): void {
    if (this.chartComponentDecisions && this.chartComponentDecisions.chart) {
      this.chartComponentDecisions.chart.update();
    }
  }
}
