import * as express from 'express';
import 'zone.js/dist/zone-node';
import { platformDynamicServer, ServerModule, PlatformState, renderModule } from '@angular/platform-server';
import { NgModule, Component, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

enableProdMode();

@Component({
    selector: 'body',
    template: '{{count}}'
})
class MyComponent {
    count: number = 0;

    ngOnInit() {
        const interval = setInterval(() => {
            this.count++;
            clearInterval(interval);
        });
    }
}

@NgModule({
    imports: [
        BrowserModule.withServerTransition({
            appId: 'app'
        }),
        ServerModule
    ],
    providers: [
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
    const app = express();

    app.get('/', (req, res) => {
        console.time('snapshot');
        const result = platformState.renderToString();
        console.timeEnd('snapshot');
        res.send(result);
    });

    app.get('/boot', async (req, res) => {
        console.time('bootstrap');
        const result = await renderModule(MyModule, {
            document: ''
        });
        console.timeEnd('bootstrap');
        res.send(result);
    });

    app.listen(4000, () => {
        console.log('listening');
    });
})();
