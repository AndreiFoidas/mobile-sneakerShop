import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import React, {useContext, useState} from "react";
import {SneakerContext} from "./SneakerProvider";
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import {add} from "ionicons/icons";
import SneakerItemList from "./SneakerItemList";
import {AuthContext} from "../auth";
import { Network } from '@capacitor/network';


const log = getLogger('SneakerList');

const SneakerList: React.FC<RouteComponentProps> = ({history}) => {
    const { logout } = useContext(AuthContext);
    const {sneakers, fetching, fetchingError} = useContext(SneakerContext);
    const [networkStatus, setNetworkStatus] = useState<boolean>(true);


    Network.getStatus().then((status: { connected: boolean | ((prevState: boolean) => boolean); }) => setNetworkStatus(status.connected));
    Network.addListener('networkStatusChange', (status: { connected: boolean | ((prevState: boolean) => boolean); }) => {
        setNetworkStatus(status.connected);
    })

    console.log(sneakers)
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Your Sneakers</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching sneakers" />
                {sneakers && (
                    <IonList>
                        {sneakers.filter(it => it._id !== undefined).map(({ _id, name, price, owned, releaseDate}) =>
                            <SneakerItemList key={_id} _id={_id} name={name} price={price} owned={owned} releaseDate={releaseDate} onEdit={id => history.push(`/sneaker/${id}`)} />
                        )}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch sneakers'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/sneaker')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={handleLogout}>
                        LOGOUT
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );

    function handleLogout() {
        log("logout");
        logout?.();
    }
};

export default SneakerList;