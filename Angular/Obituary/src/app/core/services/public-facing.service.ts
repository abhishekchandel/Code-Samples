import { Injectable } from '@angular/core';
import { BaseUrl } from '../../config/url-config'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
@Injectable({
    providedIn: 'root'
})
export class PublicFacingService {
    api = BaseUrl.baseApiUrl;
    constructor(private http: HttpClient
    ) { }
    //for search on home page , browse obits and advance search
    searchObituaries(data): Observable<any> {
        return this.http.post<any>(this.api + 'ObituaryAPI/SearchObituaries', data);
    }
    //for detail page of each obituary
    getObituaryById(data): Observable<any> {
        return this.http.post<any>(this.api + 'ObituaryAPI/GetObituaryById', data);
    }
    // for funeral homes list
    getAllFuneralHomes(data): Observable<any> {
        return this.http.post<any>(this.api + 'AccountAPI/GetAllAccounts', data);
    }
    //contact us page
    contactUs(data): Observable<any> {
        return this.http.post<any>(this.api + 'CommonAPI/ContactUs', data);
    }
    //notifications page
    subscribe(data): Observable<any> {
        return this.http.post<any>(this.api + 'CommonAPI/Subscribe', data);
    }
    //about us page dynamic content
    getDynamicContent(data): Observable<any> {
        return this.http.post<any>(this.api + 'CommonAPI/GetDynamicPageContent', data);
    }
    //resources page (support and advice)
    getAllResources(data): Observable<any> {
        return this.http.post<any>(this.api + 'CommonAPI/GetAllResources', data);
    }
    //send flowers screen
    getFlowersListing(data): Observable<any> {
        return this.http.post<any>(this.api + 'CommonAPI/GetFlowers', data);
    }
    //social links
    getSocialLinks(): Observable<any> {
        return this.http.get(this.api + 'CommonAPI/GetSocialLinks');
    }

    //dashboard links
    getDashboardUrl(): Observable<any> {
        return this.http.get(this.api + 'CommonAPI/GetDashboardUrl');
    }
    //for getting the affiliate id for EO master account
    getMasterSubaffiliateId(): Observable<any> {
        return this.http.get(this.api + 'AccountAPI/GetMasterSubAffiliateId');
    }
    //get master account details
    getMasterAccountDetails(): Observable<any> {
        return this.http.get(this.api + 'AccountAPI/GetMasterAccountDetails');
    }
    //get dashboard url for binding of the logo
    getServerUrl(): Observable<any> {
        return this.http.get(this.api + 'CommonAPI/GetDashboardUrl');
    }
}
