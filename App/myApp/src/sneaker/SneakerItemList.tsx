import React from "react";
import {Sneaker} from "./Sneaker";
import {IonItem, IonLabel} from "@ionic/react";
import moment from 'moment';

interface SneakerExt extends Sneaker{
    onEdit: (_id?: string) => void;
}

const SneakerItemList: React.FC<SneakerExt> = ({ _id, name, price, owned, releaseDate, onEdit}) => {
    return (
      <IonItem onClick = {() => onEdit(_id)}>
          <IonLabel>{name}, {price}$, owned: {owned ? "yes" : "no"}, {releaseDate}</IonLabel>
      </IonItem>
    );
};

export default  SneakerItemList;