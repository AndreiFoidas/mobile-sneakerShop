import React from "react";
import {Sneaker} from "./Sneaker";
import {IonItem, IonLabel} from "@ionic/react";
import moment from 'moment';

interface SneakerExt extends Sneaker{
    onEdit: (id?: string) => void;
}

const SneakerItemList: React.FC<SneakerExt> = ({ id, name, price, owned, releaseDate, onEdit}) => {
    return (
      <IonItem onClick = {() => onEdit(id)}>
          <IonLabel>{id} - {name}, {price}$, owned: {owned ? "yes" : "no"}, release date: {moment(releaseDate).format('DD-MMM-YYYY HH:mm:ss')}</IonLabel>
      </IonItem>
    );
};

export default  SneakerItemList;