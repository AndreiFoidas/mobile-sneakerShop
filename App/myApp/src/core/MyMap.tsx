import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { compose, withProps } from 'recompose';
import {mapsApiKey} from "./mapsApiKey";

interface MyMapProps {
    lat?: number;
    long?: number;
    onMapClick: (loc: any) => void,
    onMarkerClick: (loc: any) => void,
}

export const MyMap =
    compose<MyMapProps, any>(
        withProps({
            googleMapURL: `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places`,
            loadingElement: <div style={{ height: `50%`}} />,
            containerElement: <div style={{ height: `4000px` }} />,
            mapElement: <div style={{ height: `100%` }} />
            }),
        withScriptjs,
        withGoogleMap
    )(props => (
        <GoogleMap defaultZoom={8} defaultCenter={{ lat: props.lat, lng: props.long}} onClick={props.onMapClick}>
            <Marker position={{ lat: props.lat, lng: props.long}} onClick={props.onMarkerClick}/>
        </GoogleMap>
    ))