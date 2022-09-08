import { Component, Inject } from '@angular/core';
import { APP_CONFIG } from './app.module';

export interface ENV {
  apiDomain: string,
  apiProtocol: string,
  apiPort: string
  appTitle: string
}

@Component({
  selector: 'fe-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = this.appConfig.appTitle || "Mock Server";
  constructor(@Inject(APP_CONFIG) private appConfig: ENV) {}
}
