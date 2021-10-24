import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import SneakerList from "./sneaker/SneakerList";
import SneakerEdit from "./sneaker/SneakerEdit";
import React from "react";
import {SneakerProvider} from "./sneaker/SneakerProvider";

const App: React.FC = () => (
  <IonApp>
      <SneakerProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/sneakers" component={SneakerList} exact={true} />
            <Route path="/sneaker" component={SneakerEdit} exact={true} />
            <Route path="/sneaker/:id" component={SneakerEdit} exact={true} />
            <Route exact path="/" render={() => <Redirect to="/sneakers" />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </SneakerProvider>
  </IonApp>
);

export default App;
