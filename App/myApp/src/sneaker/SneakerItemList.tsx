import React, {useEffect, useState} from "react";
import {Sneaker} from "./Sneaker";
import {createAnimation, IonCard, IonCardSubtitle, IonContent, IonImg, IonItem, IonLabel, IonModal} from "@ionic/react";
import moment from 'moment';

interface SneakerExt extends Sneaker{
    onEdit: (_id?: string) => void;
}

const SneakerItemList: React.FC<SneakerExt> = ({ _id, name, brand, price, owned, releaseDate, latitude, longitude, webViewPath, onEdit}) => {
    /*return (
      <IonItem onClick = {() => onEdit(_id)}>
          <IonCard>{name}</IonCard>
          <IonCard>{brand}</IonCard>
          <IonCard>{price}$</IonCard>
          <IonCard>Owned: {owned ? "yes" : "no"}</IonCard>
          <IonCard>{releaseDate}</IonCard>
      </IonItem>
    );
    <IonImg src={"https://media.istockphoto.com/photos/different-shoes-displayed-in-a-shoe-shop-picture-id492339961?k=20&m=492339961&s=612x612&w=0&h=zBeYCbmu-BWSN_8m-Wamph_ecjxJtVe7JwgLvKuZ198="}/>
    <IonImg src={"https://i.imgur.com/oz6nnCQ.jpg"}/>
     */

    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseElement: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseElement.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseElement.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation().addElement(baseElement).easing('ease-out').duration(500).addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseElement: any) => {
        return enterAnimation(baseElement).direction('reverse');
    }

    return (
        <IonCard>
        <IonCard onClick={ () => onEdit(_id) }>
            {webViewPath && (<img id="image" src={webViewPath} />)}
            {!webViewPath && (<img id="image" src={'https://static.thenounproject.com/png/187803-200.png'} />)}
            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation} backdropDismiss={true} onDidDismiss={() => setShowModal(false)}>
                {webViewPath && <img id="image" src={webViewPath} width={'100px'} height={'100px'}/>}\
                {!webViewPath && <img id="image" src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>}
            </IonModal>

            <IonItem className="card-title">{brand} - {name}</IonItem>
            <IonItem className="card-subtitle">{price}$ - Owned: {owned ? "yes" : "no"} - {releaseDate}</IonItem>
            <IonItem>{latitude}x{longitude}</IonItem>
        </IonCard><IonItem onClick={() => setShowModal(true)}>Show photo</IonItem>
        </IonCard>
    );
};

export default  SneakerItemList;