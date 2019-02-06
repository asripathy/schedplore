import React, { Component } from 'react';

class PlaceList extends Component {
    state = {
        selectedPlace: 'Cupertino',
        img: undefined
    };

    renderPlaces = (places) => 
    places.map((place) => (
        <tr>
            <td>
                <div>
                    <img class="tile-img" src = {place.photo} height="70"/>
                </div>
                <div>
                    {place.name}<br/>
                    {place.address}<br/>
                    {place.rating}
                </div>
            </td>
        </tr>
    ));

    render() {
        return(
        <table class="place-list-table">
            {this.props.places &&
                this.renderPlaces(JSON.parse(this.props.places))}
        </table>    
        )
    };

}

export default PlaceList;


