import * as express from 'express';
import 'zone.js/dist/zone-node';
import { platformDynamicServer, ServerModule, PlatformState } from '@angular/platform-server';
import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@Component({
    selector: 'body',
    template: '{{count}}'
})
class MyComponent {
    count: number = 0;


    ngOnInit() {
        setInterval(() => {
            this.count++;
        });
    }
}

@NgModule({
    imports: [
        BrowserModule,
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
        res.send(
            platformState.renderToString()
        );
    });

    app.listen(4000, () => {
        console.log('listening');
    });
})();
