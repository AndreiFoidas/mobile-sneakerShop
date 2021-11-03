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
          <IonLabel>{_id} - {name}, {price}$, owned: {owned ? "yes" : "no"}, release date: {moment(releaseDate).format('DD-MMM-YYYY HH:mm:ss')}</IonLabel>
      </IonItem>
    );
};

export default  SneakerItemList;