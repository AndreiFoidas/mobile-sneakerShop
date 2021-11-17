import React from "react";
import {Sneaker} from "./Sneaker";
import {IonCard, IonCardSubtitle, IonContent, IonImg, IonItem, IonLabel} from "@ionic/react";
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

    return (
        <IonCard onClick = {() => onEdit(_id)} className="ion-card">
            {webViewPath && (<img src={webViewPath}/>)}
            {!webViewPath && (<img src={'https://static.thenounproject.com/png/187803-200.png'}/>)}
            <IonItem className="card-title">{brand} - {name}</IonItem>
            <IonItem className="card-subtitle">{price}$ - Owned: {owned ? "yes" : "no"} - {releaseDate}</IonItem>
            <IonItem>{latitude}x{longitude}</IonItem>
        </IonCard>
    );
};

export default  SneakerItemList;