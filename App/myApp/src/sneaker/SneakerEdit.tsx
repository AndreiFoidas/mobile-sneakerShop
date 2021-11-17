import {getLogger, withLogs} from "../core";
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
import {useMyLocation} from "../core/useMyLocation";
import {MyMap} from "../core/MyMap";
import {usePhotoGallery} from "../core/usePhotoGallery";

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

    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [currentLatitude, setCurrentLatitude] = useState<number | undefined>(undefined);
    const [currentLongitude, setCurrentLongitude] = useState<number | undefined>(undefined);
    const [webViewPath, setWebViewPath] = useState('');

    const location = useMyLocation();
    const {latitude : lat, longitude : long} = location.position?.coords || {};

    const {takePhoto} = usePhotoGallery();

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
           setLatitude(sneaker.latitude);
           setLongitude(sneaker.longitude);
           setWebViewPath(sneaker.webViewPath);
       }
    }, [match.params.id, sneakers]);

    useEffect(() => {
        if(latitude === undefined && longitude === undefined){
            setCurrentLatitude(lat);
            setCurrentLongitude(long);
        } else {
            setCurrentLatitude(latitude);
            setCurrentLongitude(longitude);
        }
    } ,[lat, long, latitude, longitude]);

    const handleSave = () => {
        const editedSneaker = sneaker ? {...sneaker, name, brand, price, owned, releaseDate, latitude: latitude, longitude: longitude } : { name, brand, price, owned, releaseDate, latitude: latitude, longitude: longitude, webViewPath: webViewPath };
        console.log(editedSneaker)
        saveSneaker && saveSneaker(editedSneaker).then(() => history.goBack());
    };
    log('render');

    async function handlePhotoChange(){
        console.log("handle1");
        const image = await takePhoto();
        if(!image){
            setWebViewPath('');
        } else {
            setWebViewPath(image);
        }
    }

    function setLocation() {
        setLatitude(currentLatitude);
        setLongitude(currentLongitude);
    }

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

                <IonItem>
                    <IonLabel>Choose shop location:</IonLabel>
                    <IonButton onClick={setLocation}>Set Location</IonButton>
                </IonItem>

                {webViewPath && (<img onClick={handlePhotoChange} src={webViewPath} width={'100px'} height={'100px'}/>)}
                {!webViewPath && (<img onClick={handlePhotoChange} src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}

                {lat && long &&
                    <MyMap
                        lat={currentLatitude}
                        long={currentLongitude}
                        onMapClick={log('onMapClick')}
                        onMarkerClick={log('onMarkerClick')}
                    />
                }

                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save sneaker'}</div>
                )}
            </IonContent>
        </IonPage>
    );

    function log(source: string){
        return (e: any) => {
            setCurrentLatitude(e.latLng.lat());
            setCurrentLongitude(e.latLng.lng());
            console.log(source, e.latLng.lat(), e.latLng.lng());
        }
    }
}

export default SneakerEdit;