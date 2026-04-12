import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { firstValueFrom, take, Observable, Subject } from 'rxjs';
import { reduce } from 'rxjs/operators';
import { BreadcrumbService, Breadcrumb } from 'src/app/core/services/breadcrumb.service';

function makeSnapshot(urlSegments: string[], data: Record<string, unknown> = {}) {
    return {
        url: urlSegments.map(path => ({ path })),
        data,
    };
}

function makeRoute(
    urlSegments: string[],
    data: Record<string, unknown> = {},
    children: ActivatedRoute[] = []
): Partial<ActivatedRoute> {
    return {
        snapshot: makeSnapshot(urlSegments, data) as any,
        children: children,
    };
}

function toArrayOperator() {
    return (source: Observable<Breadcrumb[]>) =>
        source.pipe(reduce((acc: Breadcrumb[][], val: Breadcrumb[]) => [...acc, val], []));
}

describe('BreadcrumbService', () => {
    let service: BreadcrumbService;
    let routerEvents$: Subject<unknown>;
    let rootRoute: Partial<ActivatedRoute>;

    beforeEach(() => {
        routerEvents$ = new Subject();
        rootRoute = makeRoute([], {}, []);

        TestBed.configureTestingModule({
            providers: [
                BreadcrumbService,
                {
                    provide: Router,
                    useValue: { events: routerEvents$.asObservable() },
                },
                {
                    provide: ActivatedRoute,
                    useValue: { root: rootRoute },
                },
            ],
        });

        service = TestBed.inject(BreadcrumbService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should expose a breadcrumbs$ observable', () => {
        expect(service.breadcrumbs$).toBeDefined();
    });

    it('should emit an empty array immediately when there are no children', async () => {
        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([]);
    });

    it('should emit breadcrumbs immediately on subscription without waiting for navigation', async () => {
        const child = makeRoute(['home'], { breadcrumb: 'Home' }) as ActivatedRoute;
        (rootRoute as any).children = [child];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs.length).toBe(1);
        expect(crumbs[0]).toEqual({ label: 'Home', url: '/home' });
    });

    it('should re-emit breadcrumbs on NavigationEnd', async () => {
        const child = makeRoute(['dashboard'], { breadcrumb: 'Dashboard' }) as ActivatedRoute;

        const emissionsPromise = firstValueFrom(
            service.breadcrumbs$.pipe(take(2), toArrayOperator())
        );

        (rootRoute as any).children = [child];
        routerEvents$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));

        const emissions = await emissionsPromise;
        expect(emissions.length).toBe(2);
    });

    it('should ignore router events that are not NavigationEnd', async () => {
        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([]);

        routerEvents$.next({ type: 'NavigationStart' });
        routerEvents$.next({ type: 'RoutesRecognized' });

        const crumbsAfter = await firstValueFrom(service.breadcrumbs$);
        expect(crumbsAfter).toEqual([]);
    });

    it('should build a single breadcrumb for a one-level route', async () => {
        const child = makeRoute(['about'], { breadcrumb: 'About' }) as ActivatedRoute;
        (rootRoute as any).children = [child];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([{ label: 'About', url: '/about' }]);
    });

    it('should skip routes without a breadcrumb data property', async () => {
        const child = makeRoute(['hidden'], {}) as ActivatedRoute;
        (rootRoute as any).children = [child];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([]);
    });

    it('should skip routes with an empty url segment even if breadcrumb label is set', async () => {
        const child = makeRoute([], { breadcrumb: 'Ghost' }) as ActivatedRoute;
        (rootRoute as any).children = [child];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([]);
    });

    it('should handle multiple sibling top-level routes', async () => {
        const child1 = makeRoute(['products'], { breadcrumb: 'Products' }) as ActivatedRoute;
        const child2 = makeRoute(['contact'], { breadcrumb: 'Contact' }) as ActivatedRoute;
        (rootRoute as any).children = [child1, child2];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([
            { label: 'Products', url: '/products' },
            { label: 'Contact', url: '/contact' },
        ]);
    });

    it('should build breadcrumbs for two-level nested routes', async () => {
        const grandchild = makeRoute(['detail'], { breadcrumb: 'Detail' }) as ActivatedRoute;
        const child = makeRoute(['products'], { breadcrumb: 'Products' }, [grandchild]) as ActivatedRoute;
        (rootRoute as any).children = [child];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([
            { label: 'Products', url: '/products' },
            { label: 'Detail', url: '/products/detail' },
        ]);
    });

    it('should build breadcrumbs for three-level deeply nested routes', async () => {
        const level3 = makeRoute(['edit'], { breadcrumb: 'Edit' }) as ActivatedRoute;
        const level2 = makeRoute(['detail'], { breadcrumb: 'Detail' }, [level3]) as ActivatedRoute;
        const level1 = makeRoute(['products'], { breadcrumb: 'Products' }, [level2]) as ActivatedRoute;
        (rootRoute as any).children = [level1];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([
            { label: 'Products', url: '/products' },
            { label: 'Detail', url: '/products/detail' },
            { label: 'Edit', url: '/products/detail/edit' },
        ]);
    });

    it('should skip intermediate segments that have no breadcrumb label', async () => {
        const grandchild = makeRoute(['detail'], { breadcrumb: 'Detail' }) as ActivatedRoute;
        const child = makeRoute(['products'], {}, [grandchild]) as ActivatedRoute;
        (rootRoute as any).children = [child];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([{ label: 'Detail', url: '/products/detail' }]);
    });

    it('should concatenate multi-segment url paths correctly', async () => {
        const child = makeRoute(['en', 'us'], { breadcrumb: 'Locale' }) as ActivatedRoute;
        (rootRoute as any).children = [child];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs).toEqual([{ label: 'Locale', url: '/en/us' }]);
    });

    it('should not double-slash when a parent segment is empty', async () => {
        const child = makeRoute(['settings'], { breadcrumb: 'Settings' }) as ActivatedRoute;
        const emptyParent = makeRoute([], {}, [child]) as ActivatedRoute;
        (rootRoute as any).children = [emptyParent];

        const crumbs = await firstValueFrom(service.breadcrumbs$);
        expect(crumbs[0].url).toBe('/settings');
        expect(crumbs[0].url).not.toContain('//');
    });
});