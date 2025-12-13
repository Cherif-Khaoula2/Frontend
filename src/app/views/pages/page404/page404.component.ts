import { Component } from '@angular/core';
import { ContainerComponent, RowComponent, ColComponent,    ButtonDirective } from '@coreui/angular';

@Component({
    selector: 'app-page404',
    templateUrl: './page404.component.html',
    styleUrls: ['./page404.component.scss'],
    imports: [ContainerComponent, RowComponent, ColComponent,    ButtonDirective]
})
export class Page404Component {

  constructor() { }

}
