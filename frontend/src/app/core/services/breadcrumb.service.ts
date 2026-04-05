import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Breadcrumb {
    label: string;
    url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
    breadcrumbs$: Observable<Breadcrumb[]>;

    constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) {
        this.breadcrumbs$ = this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            startWith(null),
            map(() => this.buildBreadcrumbs(this.activatedRoute.root))
        );
    }

    private buildBreadcrumbs(
        route: ActivatedRoute,
        url = '',
        crumbs: Breadcrumb[] = []
    ): Breadcrumb[] {
        for (const child of route.children) {
            const segment = child.snapshot.url.map(s => s.path).join('/');
            const fullUrl = segment ? `${url}/${segment}` : url;
            const label = child.snapshot.data['breadcrumb'];

            if (label && segment) {
                crumbs.push({ label, url: fullUrl });
            }

            this.buildBreadcrumbs(child, fullUrl, crumbs);
        }

        return crumbs;
    }
}