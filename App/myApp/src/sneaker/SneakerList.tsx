import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import React, {useContext, useEffect, useState} from "react";
import {SneakerContext} from "./SneakerProvider";
import {
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel,
    IonList,
    IonLoading,
    IonPage, IonSearchbar,
    IonTitle, IonToast,
    IonToolbar
} from "@ionic/react";
import {add} from "ionicons/icons";
import SneakerItemList from "./SneakerItemList";
import {AuthContext} from "../auth";
import { Network } from '@capacitor/network';
import {Sneaker} from "./Sneaker";


const log = getLogger('SneakerList');
const offset = 5;

const SneakerList: React.FC<RouteComponentProps> = ({history}) => {
    const { logout } = useContext(AuthContext);
    const {sneakers, fetching, fetchingError} = useContext(SneakerContext);

    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [visibleSneakers, setVisibleSneakers] = useState<Sneaker[] | undefined>([]);
    const [page, setPage] = useState(offset);
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>("");

    const {savedOffline, setSavedOffline} = useContext(SneakerContext);

    const [networkStatus, setNetworkStatus] = useState<boolean>(true);
    Network.getStatus().then(status => setNetworkStatus(status.connected));
    Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus(status.connected);
    })

    useEffect(() => {
        if (sneakers?.length && sneakers?.length > 0) {
            setPage(offset);
            fetchData();
            log(sneakers);
        }
    }, [sneakers]);

    useEffect(() => {
        if (sneakers && filter){
            //setVisibleItems(sneakers.filter(each -> each.))
        }
    }, [filter]);

    useEffect(() => {
        if (search === ""){
            setVisibleSneakers(sneakers);
        }
        if(sneakers && search!== ""){
            setVisibleSneakers(sneakers.filter(each => each.name.startsWith(search)));
        }
    }, [search]);

    function fetchData() {
        setVisibleSneakers(sneakers?.slice(0, page + offset));
        setPage(page + offset);
        if (sneakers && page > sneakers?.length){
            setDisableInfiniteScroll(true);
            setPage(sneakers.length);
        }
        else {
            setDisableInfiniteScroll(false);
        }
    }

    async function searchNext($event: CustomEvent<void>) {
        fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    console.log(sneakers)
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonItem>
                        <IonSearchbar style={{ width: '70%' }} placeholder="Search by name" value={search} debounce={200} onIonChange={(e) => {
                            setSearch(e.detail.value!);
                        }}>
                        </IonSearchbar>
                        <IonChip>
                            <IonLabel color={networkStatus? "success" : "danger"}>{networkStatus? "Online" : "Offline"}</IonLabel>
                        </IonChip>
                    </IonItem>
                    <br/>
                    <IonTitle>Your Sneakers</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching sneakers" />
                {visibleSneakers && (

                    <IonList>
                        {Array.from(visibleSneakers)
                            .filter(each => {
                                //if (filter !== undefined)
                                //    return each
                                return each._id !== undefined;
                            })
                            .map(({ _id, name, brand, price, owned, releaseDate}) =>
                            <SneakerItemList key={_id} _id={_id} name={name} brand={brand} price={price} owned={owned} releaseDate={releaseDate} onEdit={id => history.push(`/sneaker/${id}`)} />
                        )}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch sneakers'}</div>
                )}

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/sneaker')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={handleLogout}>
                        LOGOUT
                    </IonFabButton>
                </IonFab>
                <IonToast
                    isOpen={savedOffline ? true : false}
                    message="Your changes will be visible on server when you get back online!"
                    duration={2000}/>
            </IonContent>
        </IonPage>
    );

    function handleLogout() {
        log("logout");
        logout?.();
    }
};

export default SneakerList;