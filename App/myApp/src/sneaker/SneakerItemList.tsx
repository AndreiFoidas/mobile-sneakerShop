import React from "react";
import {Sneaker} from "./Sneaker";
import {IonCard, IonCardSubtitle, IonItem, IonLabel} from "@ionic/react";
import moment from 'moment';

interface SneakerExt extends Sneaker{
    onEdit: (_id?: string) => void;
}

const SneakerItemList: React.FC<SneakerExt> = ({ _id, name, brand, price, owned, releaseDate, onEdit}) => {
    return (
      <IonItem onClick = {() => onEdit(_id)}>
          <IonCard>{name}</IonCard>
          <IonCard>{brand}</IonCard>
          <IonCard>{price}$</IonCard>
          <IonCard>Owned: {owned ? "yes" : "no"}</IonCard>
          <IonCard>{releaseDate}</IonCard>
      </IonItem>
    );
};

export default  SneakerItemList;