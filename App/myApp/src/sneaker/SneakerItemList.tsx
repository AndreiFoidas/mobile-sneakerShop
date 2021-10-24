import React from "react";
import {Sneaker} from "./Sneaker";
import {IonItem, IonLabel} from "@ionic/react";

interface SneakerExt extends Sneaker{
    onEdit: (id?: string) => void;
}

const SneakerItemList: React.FC<SneakerExt> = ({ id, name, onEdit}) => {
    return (
      <IonItem onClick = {() => onEdit(id)}>
          <IonLabel>{id} - {name}</IonLabel>
      </IonItem>
    );
};

export default  SneakerItemList;