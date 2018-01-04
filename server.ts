import * as express from 'express';
import 'zone.js/dist/zone-node';
import { platformDynamicServer, ServerModule, PlatformState, renderModule } from '@angular/platform-server';
import { NgModule, Component, enableProdMode, Inject, InjectionToken, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Http, HttpModule } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { filter } from 'rxjs/operators/filter';
import { skip } from 'rxjs/operators/skip';
import { CommonModule } from '@angular/common';

enableProdMode();

const onRequest = new InjectionToken<Subject<void>>('onRequest');

@Component({
    selector: 'body',
    template: '<p>{{data | async | json}}</p>'
})
class MyComponent {
    data: Subject<any> = new Subject();

    constructor(
        @Inject(onRequest) private onRequest: Subject<void>,
        @Inject(HttpClient) private http: HttpClient,
        @Inject(ChangeDetectorRef) private cdRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.refreshData();
        this.onRequest.subscribe(() => {
            this.refreshData()
        });
    }

    private refreshData() {
        console.log('refreshing');
        this.http.get('http://localhost:4000/data')
            .subscribe((d) => {
                this.data.next(d);
                this.cdRef.detectChanges();
            });
    }
}

@NgModule({
    imports: [
        BrowserModule.withServerTransition({
            appId: 'app'
        }),
        HttpClientModule,
        CommonModule,
        ServerModule,
    ],
    providers: [
        {
            provide: onRequest,
            useValue: new Subject<any>()
        }
    ],
    declarations: [
        MyComponent
    ],
    bootstrap: [
        MyComponent
    ]
})
class MyModule { }

(async () => {
    const platformRef = await platformDynamicServer().bootstrapModule(MyModule);
    const platformState = platformRef.injector.get(PlatformState);
    const refreshTrigger = platformRef.injector.get(onRequest);
    const appRef = platformRef.injector.get(ApplicationRef);
    const app = express();

    app.get('/', (req, res) => {
        console.time('snapshot');
        refreshTrigger.next();
        appRef.isStable.pipe(
            filter(val => val)
        )
            .subscribe(() => {
                const result = platformState.renderToString();
                console.timeEnd('snapshot');
                res.send(result);
            })
    });

    app.get('/boot', async (req, res) => {
        console.time('bootstrap');
        const result = await renderModule(MyModule, {
            document: ''
        });
        console.timeEnd('bootstrap');
        res.send(result);
    });

    app.get('/data', (req, res) => {
        res.json({
            data: Math.random()
        });
    });

    app.listen(4000, () => {
        console.log('listening');
    });
})();
