import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import {useContext, useEffect, useState} from "react";
import {SneakerContext} from "./SneakerProvider";
import {Sneaker} from "./Sneaker";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";

const log = getLogger('SneakerEdit');

interface SneakerEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const SneakerEdit: React.FC<SneakerEditProps> = ({history, match}) => {
    const {sneakers, saving, savingError, saveSneaker} = useContext(SneakerContext);
    const [name, setName] = useState<string>('');
    const [sneaker, setSneaker] = useState<Sneaker>()

    useEffect(() => {
       log('useEffect');
       const routeID = match.params.id || '';
       const sneaker = sneakers?.find(it => it.id === routeID);
       setSneaker(sneaker);
       if (sneaker){
           setName(sneaker.name);
       }
    }, [match.params.id, sneakers]);

    const handleSave = () => {
        const editedSneaker = sneaker ? {...sneaker, name } : { name };
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
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save sneaker'}</div>
                )}
            </IonContent>
        </IonPage>
    );
}

export default SneakerEdit;