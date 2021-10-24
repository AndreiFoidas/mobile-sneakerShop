import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import React, {useContext} from "react";
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

const log = getLogger('SneakerList');

const SneakerList: React.FC<RouteComponentProps> = ({history}) => {
    const {sneakers, fetching, fetchingError} = useContext(SneakerContext);
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
                        {sneakers.map(({ id, name}) =>
                            <SneakerItemList key={id} id={id} name={name} onEdit={id => history.push(`/sneaker/${id}`)} />)}
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
            </IonContent>
        </IonPage>
    );
}

export default SneakerList;