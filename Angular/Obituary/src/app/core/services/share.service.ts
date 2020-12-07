import { Injectable } from '@angular/core';

declare const FB: any;

@Injectable({
    providedIn: 'root'
})
export class ShareService {

    openFacebookShareDialog(path: string) {
        
        FB.ui({
            method: 'share',
            href: path,
        }, function (response) { });
    }

    shareOnLinkedIn(path: string) {
        const referralUrl = path;
        const url = `https://www.linkedin.com/sharing/share-offsite?url=${referralUrl}`;
        window.open(url, '_blank', 'height=600,width=600');
    }

}
