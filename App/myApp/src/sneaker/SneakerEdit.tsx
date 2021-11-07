import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import React, {useContext, useEffect, useState} from "react";
import {SneakerContext} from "./SneakerProvider";
import {Sneaker} from "./Sneaker";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput, IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import moment from 'moment';

const log = getLogger('SneakerEdit');

interface SneakerEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const SneakerEdit: React.FC<SneakerEditProps> = ({history, match}) => {
    const {sneakers, saving, savingError, saveSneaker} = useContext(SneakerContext);
    const [name, setName] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [owned, setOwned] = useState<boolean>(false);
    const [releaseDate, setReleaseDate] = useState<string>('');
    const [sneaker, setSneaker] = useState<Sneaker>()

    useEffect(() => {
       log('useEffect');
       const routeID = match.params.id || '';
       const sneaker = sneakers?.find(it => it._id === routeID);
       setSneaker(sneaker);
       if (sneaker){
           setName(sneaker.name);
           setPrice(sneaker.price);
           setOwned(sneaker.owned);
           setReleaseDate(sneaker.releaseDate);
       }
    }, [match.params.id, sneakers]);

    const handleSave = () => {
        // log(name+" "+price+" "+owned);
        const editedSneaker = sneaker ? {...sneaker, name, price, owned, releaseDate } : { name, price, owned, releaseDate };
        log(editedSneaker)
        saveSneaker && saveSneaker(editedSneaker).then(() => history.goBack());
    };
    log('render');


    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save Sneaker
                        </IonButton>
                        <IonButton onClick={() => history.goBack()}>
                            Back
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLabel>Name: </IonLabel>
                <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                <IonLabel>Price: </IonLabel>
                <IonInput type="number" value={price} onIonChange={e => {
                    setPrice(Number(e.detail.value) || 0)
                }} />
                <IonLabel>Owned: </IonLabel>
                <IonInput value={String(owned)} onIonChange={e => setOwned((e.detail.value) == "true" || (e.detail.value) == "yes")} />
                <IonLabel>Release Date: </IonLabel>
                <IonInput value = {releaseDate} onIonChange={e => setReleaseDate(e.detail.value || '')}/>

                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save sneaker'}</div>
                )}
            </IonContent>
        </IonPage>
    );
}

export default SneakerEdit;