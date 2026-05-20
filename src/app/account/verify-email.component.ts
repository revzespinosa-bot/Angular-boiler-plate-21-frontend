import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

enum EmailStatus {
    Verifying,
    Failed
}

@Component({ templateUrl: 'verify-email.component.html', standalone: false })
export class VerifyEmailComponent implements OnInit {
    EmailStatus = EmailStatus;
    emailStatus = EmailStatus.Verifying;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        const token = this.route.snapshot.queryParams['token'];

        if (!token) {
            this.emailStatus = EmailStatus.Failed;
            return;
        }

        // remove token from url to prevent http referer leakage
        // use Location.replaceState so we don't trigger a route reuse that would
        // destroy this component and re-run ngOnInit with no token in the query params
        this.location.replaceState(this.router.url.split('?')[0]);

        this.accountService.verifyEmail(token)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Verification successful, you can now login', { keepAfterRouteChange: true });
                    this.router.navigate(['../login'], { relativeTo: this.route });
                },
                error: error => {
                    console.error('verifyEmail failed:', error);
                    this.emailStatus = EmailStatus.Failed;
                }
            });
    }
}
