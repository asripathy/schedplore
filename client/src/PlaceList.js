import React, { Component } from 'react';

class PlaceList extends Component {
    state = {
        selectedPlace: 'Cupertino',
        img: undefined
    };

    renderPlaces = (places) => 
    places.map((place) => (
        <tr>
            <td onClick={()=>this.props.updateCalendar(place)}>
            <div class="card card-class">
                <img class="card-img-top" src={place.photo} alt="Card image cap"/>
                <div class="card-body">
                    <h5 class="card-title">{place.name}</h5>
                    <p class="card-text">{place.address}</p>
                    <p class="card-text">Rating: {place.rating}</p>
                </div>
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


