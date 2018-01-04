import * as express from 'express';
import 'zone.js/dist/zone-node';
import { platformDynamicServer, ServerModule, PlatformState } from '@angular/platform-server';
import { NgModule, Component, Inject, InjectionToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { Subject } from 'rxjs/Subject';
const firestoreToken = new InjectionToken<any>('firestore');

function getFirestore() {
    firebase.initializeApp({
        apiKey: "AIzaSyAwRrxjjft7KMdhwfLKPkd8PCBR3JFaLfo",
        authDomain: "angularfirestore.firebaseapp.com",
        databaseURL: "https://angularfirestore.firebaseio.com",
        projectId: "angularfirestore",
        storageBucket: "angularfirestore.appspot.com",
        messagingSenderId: "1039984584356"
    });
    return firebase.firestore();
}

@Component({
    selector: 'body',
    template: '{{ data | async | json }}'
})
class MyComponent {
    data = new Subject<any>();

    constructor(
        @Inject(firestoreToken) private firestore: any
    ) { }

    ngOnInit() {
        this.firestore.collection('a').onSnapshot(snap => {
            this.data.next(snap.docs.map(doc => doc.data()));
        });
    }
}

@NgModule({
    imports: [
        BrowserModule,
        ServerModule
    ],
    providers: [
        {
            provide: firestoreToken,
            useFactory: getFirestore
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
