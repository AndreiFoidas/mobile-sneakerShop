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
    IonInput, IonItem, IonLabel,
    IonLoading,
    IonPage, IonSelect, IonSelectOption,
    IonTitle, IonToggle,
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
    const [brand, setBrand] = useState<string>('');
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
           setBrand(sneaker.brand);
           setPrice(sneaker.price);
           setOwned(sneaker.owned);
           setReleaseDate(sneaker.releaseDate);
       }
    }, [match.params.id, sneakers]);

    const handleSave = () => {
        const editedSneaker = sneaker ? {...sneaker, name, brand, price, owned, releaseDate } : { name, brand, price, owned, releaseDate };
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
                <IonItem>
                    <IonLabel>Name: </IonLabel>
                    <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                </IonItem>

                <IonItem>
                    <IonLabel>Brand:  </IonLabel>
                    <IonSelect value={brand} onIonChange={e => setBrand(e.detail.value)}>
                        <IonSelectOption value="Nike">Nike</IonSelectOption>
                        <IonSelectOption value="Adidas">Adidas</IonSelectOption>
                        <IonSelectOption value="New Balance">New Balance</IonSelectOption>
                        <IonSelectOption value="Puma">Puma</IonSelectOption>
                        <IonSelectOption value="Vans">Vans</IonSelectOption>
                        <IonSelectOption value="Converse">Converse</IonSelectOption>
                    </IonSelect>
                </IonItem>

                <IonItem>
                    <IonLabel>Price: </IonLabel>
                    <IonInput type="number" value={price} onIonChange={e => {
                        setPrice(Number(e.detail.value) || 0)
                    }} />
                </IonItem>

                <IonItem>
                    <IonLabel>Owned: </IonLabel>
                    <IonToggle checked={owned} onIonChange={e => setOwned(e.detail.checked)}/>
                </IonItem>

                <IonItem>
                    <IonLabel>Release Date: </IonLabel>
                    <IonInput value = {releaseDate} onIonChange={e => setReleaseDate(e.detail.value || '')}/>
                </IonItem>

                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save sneaker'}</div>
                )}
            </IonContent>
        </IonPage>
    );
}

export default SneakerEdit;