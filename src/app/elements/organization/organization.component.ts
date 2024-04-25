import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {OrganizationService, SettingService} from '@app/services';
import {Organization} from '@app/model';
import {DEFAULT_ORG_ID, ROOT_ORG_ID} from '@app/globals';

@Component({
  selector: 'elements-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
})
export class ElementOrganizationComponent implements OnInit, OnDestroy {
  currentOrg: Organization = {id: '', name: ''};
  organizations = [];
  @Input() isK8s: boolean = false;
  constructor(private _cookie: CookieService,
              public _settingSvc: SettingService,
              private _orgSvc: OrganizationService
  ) {}

  ngOnInit() {
    const cookieOrgId = this._cookie.get('X-JMS-LUNA-ORG') || this._cookie.get('X-JMS-ORG');
    this._orgSvc.orgListChange$.subscribe(async(res) => {
      this.organizations = res;
      const cookieOrg = await this.organizations.find(i => i.id === cookieOrgId);
      if (!cookieOrg) {
        this.currentOrg = this.getPropOrg();
        this._orgSvc.switchOrg(this.currentOrg);
      } else {
        this.currentOrg = cookieOrg;
      }
    });
  }

  ngOnDestroy() {
    this._orgSvc.orgListChange$.unsubscribe();
  }

  getPropOrg() {
    let org = this.organizations.find(item => item.id === DEFAULT_ORG_ID);
    if (!org) {
      org = this.organizations.filter(item => item.id !== ROOT_ORG_ID)[0];
    }
    if (!org) {
      org = this.organizations[0];
    }
    return org;
  }

  changeOrg(event) {
    this.currentOrg = event.value;
    this._orgSvc.switchOrg(this.currentOrg);
  }
}
